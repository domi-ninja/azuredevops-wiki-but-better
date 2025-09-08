import type { Request, Response } from 'express';
import express from 'express';
import fs from 'fs-extra';
import matter from 'gray-matter';
import { marked } from 'marked';
import path from 'path';
import { getAbsoluteWikiPath, loadConfig } from '../config/config.js';
import { WikiPage, WikiStructure } from '../types/wiki.js';

const router = express.Router();

// Get wiki structure (folders and files)
const getStructureHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    
    if (!fs.existsSync(wikiPath)) {
      res.status(404).json({ error: 'Wiki path not found' });
      return;
    }

    const structure = await buildWikiStructure(wikiPath);
    res.json(structure);
  } catch (error) {
    console.error('Error getting wiki structure:', error);
    res.status(500).json({ error: 'Failed to get wiki structure' });
  }
};
router.get('/structure', getStructureHandler);

// Get page content
const getPageHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    const wildcardParams = req.params as unknown as { 0?: string };
    let pagePath = wildcardParams[0] || '';
    
    // Add .md extension if not present
    if (!pagePath.endsWith('.md')) {
      pagePath = `${pagePath}.md`;
    }
    
    const fullPath = path.join(wikiPath, pagePath);

    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    const parsed = matter(content);
    
    const page: WikiPage = {
      path: pagePath,
      title: parsed.data.title || path.basename(pagePath, '.md'),
      content: parsed.content,
      html: marked(parsed.content),
      metadata: parsed.data,
      lastModified: (await fs.stat(fullPath)).mtime
    };

    res.json(page);
  } catch (error) {
    console.error('Error getting page:', error);
    res.status(500).json({ error: 'Failed to get page' });
  }
};
router.get('/page/*', getPageHandler);

// Save page content
const putPageHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    const wildcardParams = req.params as unknown as { 0?: string };
    const pagePath = wildcardParams[0] || '';
    const fullPath = path.join(wikiPath, pagePath);
    const { content, metadata } = req.body;

    // Ensure directory exists
    await fs.ensureDir(path.dirname(fullPath));

    // Create content with frontmatter
    const fileContent = matter.stringify(content, metadata || {});
    await fs.writeFile(fullPath, fileContent);

    res.json({ success: true, path: pagePath });
  } catch (error) {
    console.error('Error saving page:', error);
    res.status(500).json({ error: 'Failed to save page' });
  }
};
router.put('/page/*', putPageHandler);

// Create new page
const postPageHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    const { path: pagePath, title, content } = req.body;
    const fullPath = path.join(wikiPath, pagePath);

    if (fs.existsSync(fullPath)) {
      res.status(409).json({ error: 'Page already exists' });
      return;
    }

    await fs.ensureDir(path.dirname(fullPath));
    
    const metadata = { title };
    const fileContent = matter.stringify(content || '', metadata);
    await fs.writeFile(fullPath, fileContent);

    res.json({ success: true, path: pagePath });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
};
router.post('/page', postPageHandler);

// Delete page
const deletePageHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    const wildcardParams = req.params as unknown as { 0?: string };
    const pagePath = wildcardParams[0] || '';
    const fullPath = path.join(wikiPath, pagePath);

    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    await fs.remove(fullPath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
};
router.delete('/page/*', deletePageHandler);

async function buildWikiStructure(wikiPath: string, relativePath = ''): Promise<WikiStructure> {
  const items: WikiStructure[] = [];
  const currentPath = path.join(wikiPath, relativePath);

  // Read .order file if it exists
  const orderFile = path.join(currentPath, '.order');
  let order: string[] = [];
  if (fs.existsSync(orderFile)) {
    const orderContent = await fs.readFile(orderFile, 'utf-8');
    order = orderContent.split('\n').map(line => line.trim()).filter(Boolean);
  }

  const entries = (await fs.readdir(currentPath, { withFileTypes: true }))
    .filter(e => !e.name.startsWith('.'));

  // Group by base name to merge same-named file/folder
  const baseNameToGroup: Record<string, { baseName: string; dir?: fs.Dirent; file?: fs.Dirent }> = {};
  for (const entry of entries) {
    const baseName = entry.isFile() && entry.name.endsWith('.md')
      ? entry.name.slice(0, -3)
      : entry.name;
    if (!baseNameToGroup[baseName]) {
      baseNameToGroup[baseName] = { baseName };
    }
    if (entry.isDirectory()) {
      baseNameToGroup[baseName].dir = entry;
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      baseNameToGroup[baseName].file = entry;
    }
  }

  const processed = new Set<string>();

  // Respect .order if present; allow entries like "Foo" or "Foo.md"
  for (const ordered of order) {
    const baseName = ordered.endsWith('.md') ? ordered.slice(0, -3) : ordered;
    if (processed.has(baseName)) continue;
    const group = baseNameToGroup[baseName];
    if (group) {
      const merged = await createMergedStructureItem(group, wikiPath, relativePath);
      if (merged) items.push(merged);
      processed.add(baseName);
    }
  }

  // Add remaining items not covered by order
  for (const [baseName, group] of Object.entries(baseNameToGroup)) {
    if (processed.has(baseName)) continue;
    const merged = await createMergedStructureItem(group, wikiPath, relativePath);
    if (merged) items.push(merged);
  }

  return {
    name: path.basename(relativePath) || 'Wiki',
    type: 'folder',
    path: relativePath,
    children: items
  };
}

async function createMergedStructureItem(
  group: { baseName: string; dir?: fs.Dirent; file?: fs.Dirent },
  wikiPath: string,
  relativePath: string
): Promise<WikiStructure | null> {
  const name = group.baseName;
  const folderPath = path.join(relativePath, name);
  const filePathWithExt = path.join(relativePath, `${name}.md`);
  const fullFilePath = path.join(wikiPath, filePathWithExt);

  // Both folder and file exist: merge into folder node with pagePath
  if (group.dir && group.file) {
    const childrenStructure = await buildWikiStructure(wikiPath, folderPath);
    const stats = await fs.stat(fullFilePath).catch(() => null);
    return {
      name,
      type: 'folder',
      path: folderPath,
      children: childrenStructure.children,
      lastModified: stats ? stats.mtime : undefined,
      pagePath: filePathWithExt.replace(/\.md$/, '')
    };
  }

  // Only folder exists
  if (group.dir && !group.file) {
    const childrenStructure = await buildWikiStructure(wikiPath, folderPath);
    return {
      name,
      type: 'folder',
      path: folderPath,
      children: childrenStructure.children
    };
  }

  // Only file exists
  if (!group.dir && group.file) {
    const stats = await fs.stat(fullFilePath);
    return {
      name,
      type: 'file',
      path: filePathWithExt.replace(/\.md$/, ''),
      lastModified: stats.mtime
    };
  }

  return null;
}

export { router as wikiRoutes };
