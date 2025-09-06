import { FileText, Home, Settings } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWiki } from '../contexts/WikiContext';
import ConnectionStatus from './ConnectionStatus';
import ErrorBoundary from './ErrorBoundary';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { state } = useWiki();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
              <FileText className="h-6 w-6" />
              <h1 className="text-xl font-bold">DevOps Wiki Better</h1>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'bg-primary-100 text-primary-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/settings"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/settings' 
                  ? 'bg-primary-100 text-primary-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {state.config?.pathExists && (
          <aside className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
            <Sidebar />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Connection Status Indicator */}
      <ConnectionStatus />
    </div>
  );
}
