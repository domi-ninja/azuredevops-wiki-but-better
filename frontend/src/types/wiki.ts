export interface WikiPage {
  path: string;
  title: string;
  content: string;
  html: string;
  metadata: Record<string, any>;
  lastModified: Date;
}

export interface WikiStructure {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: WikiStructure[];
  lastModified?: Date;
  // If a folder has a same-named markdown file, link to it here (without .md)
  pagePath?: string;
}

export interface WikiConfig {
  wikiPath: string;
  port?: number;
  allowedExtensions?: string[];
  maxFileSize?: number;
  absolutePath?: string;
  pathExists?: boolean;
}

export interface FileUploadResult {
  success: boolean;
  fileName: string;
  originalName: string;
  size: number;
  markdownLink: string;
  url: string;
}

export interface AttachmentFile {
  name: string;
  size: number;
  lastModified: Date;
  url: string;
}
