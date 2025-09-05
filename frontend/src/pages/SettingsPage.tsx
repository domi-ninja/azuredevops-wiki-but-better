import { AlertCircle, CheckCircle, FolderOpen, Save } from 'lucide-react';
import { useState } from 'react';
import { useWiki } from '../contexts/WikiContext';

export default function SettingsPage() {
  const { state, updateConfig } = useWiki();
  const [wikiPath, setWikiPath] = useState(state.config?.wikiPath || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await updateConfig({ wikiPath });
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save configuration' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (!state.config) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Configure your DevOps Wiki Better installation.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Wiki Configuration</h2>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="wikiPath" className="block text-sm font-medium text-gray-700 mb-2">
                Wiki Path
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="wikiPath"
                  value={wikiPath}
                  onChange={(e) => setWikiPath(e.target.value)}
                  className="input pr-10"
                  placeholder="../Aurora.wiki"
                />
                <FolderOpen className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Path to your wiki directory (relative or absolute)
              </p>
            </div>

            {state.config.absolutePath && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolved Path
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                    {state.config.absolutePath}
                  </code>
                  {state.config.pathExists ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {state.config.pathExists 
                    ? 'Directory exists and is accessible' 
                    : 'Directory not found or not accessible'
                  }
                </p>
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <p className={`text-sm ${
                    message.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
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
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About DevOps Wiki Better</h3>
          <p className="text-blue-700 text-sm">
            This is a modern clone of Azure DevOps Wiki with enhanced features including:
          </p>
          <ul className="mt-2 text-blue-700 text-sm space-y-1 ml-4">
            <li>• WYSIWYG markdown editing with Monaco Editor</li>
            <li>• Tree-style navigation with collapsible folders</li>
            <li>• Support for .order files for custom ordering</li>
            <li>• Image upload with automatic attachment management</li>
            <li>• Real-time preview and modern UI</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
