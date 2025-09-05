import { Calendar, Edit, FileText } from 'lucide-react';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useWiki } from '../contexts/WikiContext';

export default function WikiPage() {
  const { '*': pagePath } = useParams();
  const { state, loadPage } = useWiki();

  useEffect(() => {
    if (pagePath) {
      loadPage(pagePath);
    }
  }, [pagePath, loadPage]);

  if (state.loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (state.error) {
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

  if (!state.currentPage) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Page Selected</h2>
          <p className="text-gray-600 mb-6">
            Select a page from the sidebar to view its contents.
          </p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const { currentPage } = state;

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {currentPage.title}
            </h1>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  Last modified: {new Date(currentPage.lastModified).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                <span>{currentPage.path}</span>
              </div>
            </div>
          </div>
          
          <Link
            to={`/edit/${currentPage.path}`}
            className="btn-primary flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="prose prose-lg max-w-none markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                // Custom link renderer to handle wiki links
                a: ({ href, children, ...props }) => {
                  if (href?.startsWith('/') && !href.startsWith('/.attachments')) {
                    return (
                      <Link to={`/wiki${href}`} className="text-primary-600 hover:text-primary-800 underline">
                        {children}
                      </Link>
                    );
                  }
                  return (
                    <a href={href} {...props} className="text-primary-600 hover:text-primary-800 underline">
                      {children}
                    </a>
                  );
                },
                // Custom image renderer for attachments
                img: ({ src, alt, ...props }) => {
                  return (
                    <img
                      src={src}
                      alt={alt}
                      {...props}
                      className="max-w-full h-auto rounded-md shadow-sm"
                      loading="lazy"
                    />
                  );
                }
              }}
            >
              {currentPage.content}
            </ReactMarkdown>
          </div>
        </div>
      </main>
    </div>
  );
}
