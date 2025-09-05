import express from 'express';
import fs from 'fs-extra';
import matter from 'gray-matter';
import { marked } from 'marked';
import path from 'path';
import { getAbsoluteWikiPath, loadConfig } from '../config/config.js';
import { WikiPage, WikiStructure } from '../types/wiki.js';

const router = express.Router();

// Get wiki structure (folders and files)
router.get('/structure', async (req, res) => {
  try {
    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    
    if (!fs.existsSync(wikiPath)) {
      return res.status(404).json({ error: 'Wiki path not found' });
    }

    const structure = await buildWikiStructure(wikiPath);
    res.json(structure);
  } catch (error) {
    console.error('Error getting wiki structure:', error);
    res.status(500).json({ error: 'Failed to get wiki structure' });
  }
});

// Get page content
router.get('/page/*', async (req, res) => {
  try {
    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    const pagePath = req.params[0];
    const fullPath = path.join(wikiPath, pagePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Page not found' });
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
});

// Save page content
router.put('/page/*', async (req, res) => {
  try {
    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    const pagePath = req.params[0];
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
});

// Create new page
router.post('/page', async (req, res) => {
  try {
    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    const { path: pagePath, title, content } = req.body;
    const fullPath = path.join(wikiPath, pagePath);

    if (fs.existsSync(fullPath)) {
      return res.status(409).json({ error: 'Page already exists' });
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
});

// Delete page
router.delete('/page/*', async (req, res) => {
  try {
    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    const pagePath = req.params[0];
    const fullPath = path.join(wikiPath, pagePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Page not found' });
    }

    await fs.remove(fullPath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

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

  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const allItems = new Set(entries.map(entry => entry.name));
  
  // Add ordered items first
  for (const itemName of order) {
    if (allItems.has(itemName)) {
      const entry = entries.find(e => e.name === itemName);
      if (entry) {
        const item = await createStructureItem(entry, wikiPath, relativePath);
        if (item) items.push(item);
        allItems.delete(itemName);
      }
    }
  }

  // Add remaining items
  for (const entry of entries) {
    if (allItems.has(entry.name) && !entry.name.startsWith('.')) {
      const item = await createStructureItem(entry, wikiPath, relativePath);
      if (item) items.push(item);
    }
  }

  return {
    name: path.basename(relativePath) || 'Wiki',
    type: 'folder',
    path: relativePath,
    children: items
  };
}

async function createStructureItem(
  entry: fs.Dirent, 
  wikiPath: string, 
  relativePath: string
): Promise<WikiStructure | null> {
  const itemPath = path.join(relativePath, entry.name);
  const fullPath = path.join(wikiPath, itemPath);

  if (entry.isDirectory()) {
    const children = await buildWikiStructure(wikiPath, itemPath);
    return {
      name: entry.name,
      type: 'folder',
      path: itemPath,
      children: children.children
    };
  } else if (entry.isFile() && entry.name.endsWith('.md')) {
    const stats = await fs.stat(fullPath);
    return {
      name: entry.name.replace('.md', ''),
      type: 'file',
      path: itemPath,
      lastModified: stats.mtime
    };
  }

  return null;
}

export { router as wikiRoutes };
