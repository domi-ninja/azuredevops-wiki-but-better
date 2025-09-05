import Editor from '@monaco-editor/react';
import { Eye, FileText, Save, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate, useParams } from 'react-router-dom';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useWiki } from '../contexts/WikiContext';
import * as api from '../services/api';

export default function EditPage() {
  const { '*': pagePath } = useParams();
  const navigate = useNavigate();
  const { state, loadPage, savePage, setEditing } = useWiki();
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setEditing(true);
    
    if (pagePath) {
      loadPage(pagePath);
    }

    return () => {
      setEditing(false);
    };
  }, [pagePath, loadPage, setEditing]);

  useEffect(() => {
    if (state.currentPage) {
      setContent(state.currentPage.content);
      setTitle(state.currentPage.title);
    }
  }, [state.currentPage]);

  const handleSave = async () => {
    if (!pagePath) return;
    
    setSaving(true);
    try {
      await savePage(pagePath, content, { title });
      navigate(`/wiki/${pagePath}`);
    } catch (error) {
      console.error('Failed to save page:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await api.uploadFile(file);
      // Insert the markdown link at the current cursor position
      setContent(prev => prev + '\n\n' + result.markdownLink);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (pagePath) {
      navigate(`/wiki/${pagePath}`);
    } else {
      navigate('/');
    }
  };

  if (state.loading && !state.currentPage) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (state.error && !state.currentPage) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-6">{state.error}</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
              placeholder="Page title..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Editing: {pagePath}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="btn-secondary cursor-pointer flex items-center space-x-2">
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                className="hidden"
              />
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>Upload</span>
            </label>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`btn-secondary flex items-center space-x-2 ${
                showPreview ? 'bg-primary-100 text-primary-900' : ''
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
            
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <main className="flex-1 flex overflow-hidden">
        {showPreview ? (
          // Split view: Editor and Preview
          <>
            <div className="flex-1 border-r border-gray-200">
              <Editor
                height="100%"
                defaultLanguage="markdown"
                value={content}
                onChange={(value) => setContent(value || '')}
                theme="vs"
                options={{
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  fontSize: 14,
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="prose prose-lg max-w-none markdown-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Full editor view
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="markdown"
              value={content}
              onChange={(value) => setContent(value || '')}
              theme="vs"
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'on',
                fontSize: 14,
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
