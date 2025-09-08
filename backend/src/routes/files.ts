import type { Request, Response } from 'express';
import express from 'express';
import fs from 'fs-extra';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getAbsoluteWikiPath, loadConfig } from '../config/config.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const config = loadConfig();
    const allowedExtensions = config.allowedExtensions || ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed`));
    }
  }
});

// Upload file to .attachments
const uploadHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    const attachmentsPath = path.join(wikiPath, '.attachments');
    
    // Ensure attachments directory exists
    await fs.ensureDir(attachmentsPath);

    // Generate unique filename
    const ext = path.extname(req.file.originalname);
    const baseName = path.basename(req.file.originalname, ext);
    const uniqueId = uuidv4();
    const fileName = `${baseName}-${uniqueId}${ext}`;
    const filePath = path.join(attachmentsPath, fileName);

    // Save file
    await fs.writeFile(filePath, req.file.buffer);

    // Return markdown link format
    const markdownLink = `![${req.file.originalname}](/.attachments/${fileName})`;
    
    res.json({
      success: true,
      fileName,
      originalName: req.file.originalname,
      size: req.file.size,
      markdownLink,
      url: `/.attachments/${fileName}`
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};
router.post('/upload', upload.single('file'), uploadHandler);

// List files in .attachments
const listAttachmentsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    const attachmentsPath = path.join(wikiPath, '.attachments');

    if (!fs.existsSync(attachmentsPath)) {
      res.json([]);
      return;
    }

    const files = await fs.readdir(attachmentsPath);
    const fileDetails = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(attachmentsPath, fileName);
        const stats = await fs.stat(filePath);
        return {
          name: fileName,
          size: stats.size,
          lastModified: stats.mtime,
          url: `/.attachments/${fileName}`
        };
      })
    );

    res.json(fileDetails);
  } catch (error) {
    console.error('Error listing attachments:', error);
    res.status(500).json({ error: 'Failed to list attachments' });
  }
};
router.get('/attachments', listAttachmentsHandler);

// Delete attachment
const deleteAttachmentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = loadConfig();
    const wikiPath = getAbsoluteWikiPath(config);
    const fileName = req.params.fileName;
    const filePath = path.join(wikiPath, '.attachments', fileName);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    await fs.remove(filePath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
};
router.delete('/attachments/:fileName', deleteAttachmentHandler);

export { router as fileRoutes };
