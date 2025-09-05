import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface WikiConfig {
  wikiPath: string;
  port?: number;
  allowedExtensions?: string[];
  maxFileSize?: number;
}

const DEFAULT_CONFIG: WikiConfig = {
  wikiPath: '../Aurora.wiki',
  port: 3001,
  allowedExtensions: ['.md', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf'],
  maxFileSize: 10 * 1024 * 1024 // 10MB
};

const CONFIG_FILE = path.join(__dirname, '../../../config.json');

export function loadConfig(): WikiConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readJsonSync(CONFIG_FILE);
      return { ...DEFAULT_CONFIG, ...configData };
    }
  } catch (error) {
    console.warn('Failed to load config file, using defaults:', error);
  }
  
  // Create default config file
  saveConfig(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

export function saveConfig(config: WikiConfig): void {
  try {
    fs.ensureFileSync(CONFIG_FILE);
    fs.writeJsonSync(CONFIG_FILE, config, { spaces: 2 });
    console.log('Configuration saved to', CONFIG_FILE);
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}

export function getAbsoluteWikiPath(config: WikiConfig): string {
  if (path.isAbsolute(config.wikiPath)) {
    return config.wikiPath;
  }
  return path.resolve(__dirname, '../../../', config.wikiPath);
}
