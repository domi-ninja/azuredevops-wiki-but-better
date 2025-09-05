import express from 'express';
import fs from 'fs-extra';
import { getAbsoluteWikiPath, loadConfig, saveConfig } from '../config/config.js';

const router = express.Router();

// Get current configuration
router.get('/', (req, res) => {
  try {
    const config = loadConfig();
    const absolutePath = getAbsoluteWikiPath(config);
    const pathExists = fs.existsSync(absolutePath);
    
    res.json({
      ...config,
      absolutePath,
      pathExists
    });
  } catch (error) {
    console.error('Error getting config:', error);
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

// Update configuration
router.put('/', (req, res) => {
  try {
    const currentConfig = loadConfig();
    const updatedConfig = { ...currentConfig, ...req.body };
    
    saveConfig(updatedConfig);
    
    const absolutePath = getAbsoluteWikiPath(updatedConfig);
    const pathExists = fs.existsSync(absolutePath);
    
    res.json({
      ...updatedConfig,
      absolutePath,
      pathExists
    });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

export { router as configRoutes };
