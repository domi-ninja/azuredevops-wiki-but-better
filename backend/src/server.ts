import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config/config.js';
import { configRoutes } from './routes/config.js';
import { fileRoutes } from './routes/files.js';
import { wikiRoutes } from './routes/wiki.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load configuration
const config = loadConfig();

// Routes
app.use('/api/wiki', wikiRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/config', configRoutes);

// Serve static files (attachments)
if (config.wikiPath) {
  app.use('/.attachments', express.static(path.join(config.wikiPath, '.attachments')));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    wikiPath: config.wikiPath 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DevOps Wiki Better backend running on port ${PORT}`);
  console.log(`📁 Wiki path: ${config.wikiPath || 'Not configured'}`);
});

export default app;
