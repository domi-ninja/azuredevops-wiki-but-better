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
}

export interface FileUploadResult {
  success: boolean;
  fileName: string;
  originalName: string;
  size: number;
  markdownLink: string;
  url: string;
}
