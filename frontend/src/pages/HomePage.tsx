import { FileText, FolderOpen, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWiki } from '../contexts/WikiContext';

export default function HomePage() {
  const { state } = useWiki();

  if (!state.config) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!state.config.pathExists) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="max-w-md text-center">
          <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wiki Not Found</h2>
          <p className="text-gray-600 mb-6">
            The wiki directory could not be found. Please check your configuration.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Looking for: <code className="bg-gray-100 px-2 py-1 rounded">{state.config.absolutePath}</code>
          </p>
          <Link to="/settings" className="btn-primary">
            Configure Wiki Path
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to DevOps Wiki Better</h1>
          <p className="text-lg text-gray-600">
            A modern, enhanced clone of Azure DevOps Wiki with improved editing and navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-primary-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Markdown Support</h3>
            </div>
            <p className="text-gray-600">
              Full GitHub Flavored Markdown support with live preview and WYSIWYG editing.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <FolderOpen className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Tree Navigation</h3>
            </div>
            <p className="text-gray-600">
              Intuitive folder structure with collapsible navigation and custom ordering support.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Git Integration</h3>
            </div>
            <p className="text-gray-600">
              Changes are committed to git, allowing you to push back to Azure DevOps Wiki.
            </p>
          </div>
        </div>

        {state.structure && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wiki Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {countPages(state.structure)}
                </div>
                <div className="text-sm text-gray-500">Pages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {countFolders(state.structure)}
                </div>
                <div className="text-sm text-gray-500">Folders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {state.config.wikiPath}
                </div>
                <div className="text-sm text-gray-500">Wiki Path</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {state.config.pathExists ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-500">Status</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function countPages(structure: any): number {
  if (!structure.children) return structure.type === 'file' ? 1 : 0;
  return structure.children.reduce((count: number, child: any) => {
    return count + countPages(child);
  }, 0);
}

function countFolders(structure: any): number {
  if (!structure.children) return structure.type === 'folder' ? 1 : 0;
  return structure.children.reduce((count: number, child: any) => {
    return count + countFolders(child);
  }, structure.type === 'folder' ? 1 : 0);
}
