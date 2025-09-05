import axios from 'axios';
import { AttachmentFile, FileUploadResult, WikiConfig, WikiPage, WikiStructure } from '../types/wiki';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Wiki Structure
export async function getWikiStructure(): Promise<WikiStructure> {
  const response = await api.get('/wiki/structure');
  return response.data;
}

// Pages
export async function getPage(path: string): Promise<WikiPage> {
  const response = await api.get(`/wiki/page/${path}`);
  return {
    ...response.data,
    lastModified: new Date(response.data.lastModified)
  };
}

export async function savePage(path: string, content: string, metadata?: Record<string, any>): Promise<void> {
  await api.put(`/wiki/page/${path}`, { content, metadata });
}

export async function createPage(path: string, title: string, content?: string): Promise<void> {
  await api.post('/wiki/page', { path, title, content });
}

export async function deletePage(path: string): Promise<void> {
  await api.delete(`/wiki/page/${path}`);
}

// Files
export async function uploadFile(file: File): Promise<FileUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

export async function getAttachments(): Promise<AttachmentFile[]> {
  const response = await api.get('/files/attachments');
  return response.data.map((file: any) => ({
    ...file,
    lastModified: new Date(file.lastModified)
  }));
}

export async function deleteAttachment(fileName: string): Promise<void> {
  await api.delete(`/files/attachments/${fileName}`);
}

// Configuration
export async function getConfig(): Promise<WikiConfig> {
  const response = await api.get('/config');
  return response.data;
}

export async function updateConfig(config: Partial<WikiConfig>): Promise<WikiConfig> {
  const response = await api.put('/config', config);
  return response.data;
}
