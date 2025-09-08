import { ChevronDown, ChevronRight, File, Folder, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWiki } from '../contexts/WikiContext';
import { WikiStructure } from '../types/wiki';

export default function Sidebar() {
  const { state, loadStructure } = useWiki();
  const location = useLocation();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (state.config?.pathExists && !state.structure) {
      loadStructure();
    }
  }, [state.config, state.structure, loadStructure]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderStructureItem = (item: WikiStructure, level = 0) => {
    const isExpanded = expandedFolders.has(item.path);
    const effectivePath = item.type === 'folder' && item.pagePath ? item.pagePath : item.path;
    const isCurrentPage = location.pathname === `/wiki/${effectivePath}`;
    const paddingLeft = `${level * 20 + 12}px`;

    if (item.type === 'folder') {
      return (
        <div key={item.path}>
          <div
            className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${
              isCurrentPage ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500' : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={{ paddingLeft }}
          >
            <button
              onClick={() => toggleFolder(item.path)}
              className="mr-1 p-0.5 rounded hover:bg-gray-200 text-gray-700"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <Folder className="h-4 w-4 mr-2 text-blue-500" />
            {item.pagePath ? (
              <Link to={`/wiki/${item.pagePath}`} className="truncate">
                {item.name}
              </Link>
            ) : (
              <span className="truncate">{item.name}</span>
            )}
          </div>
          
          {isExpanded && item.children && (
            <div>
              {item.children.map(child => renderStructureItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={`/wiki/${item.path}`}
        className={`flex items-center px-3 py-2 text-sm transition-colors ${
          isCurrentPage
            ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        style={{ paddingLeft }}
      >
        <File className="h-4 w-4 mr-2 text-gray-400" />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  if (state.loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{state.error}</p>
          <button
            onClick={loadStructure}
            className="mt-2 text-xs text-red-700 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Wiki Pages</h2>
          <button
            onClick={() => {/* TODO: Add new page functionality */}}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="New Page"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.structure?.children?.length ? (
          <div className="py-2">
            {state.structure.children.map(item => renderStructureItem(item))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <File className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No pages found</p>
            <p className="text-xs text-gray-400 mt-1">
              Create your first markdown file in the wiki directory
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
