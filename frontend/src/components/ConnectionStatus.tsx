import { AlertTriangle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [retryCount, setRetryCount] = useState(0);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        setStatus('connected');
        setRetryCount(0);
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      setStatus('disconnected');
      setRetryCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Set up polling - check every 5 seconds when disconnected, every 30 seconds when connected
    const interval = setInterval(
      checkConnection, 
      status === 'disconnected' ? 5000 : 30000
    );

    return () => clearInterval(interval);
  }, [status]);

  if (status === 'checking') {
    return null;
  }

  if (status === 'connected') {
    return null; // Don't show anything when connected
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {retryCount > 3 ? (
              <XCircle className="h-5 w-5 text-red-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600 animate-pulse" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Backend Connection Lost
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {retryCount > 3 
                ? 'Unable to connect to the backend server. Please ensure the server is running.'
                : 'Attempting to reconnect to the backend server...'}
            </p>
            {retryCount > 0 && (
              <p className="mt-1 text-xs text-red-600">
                Retry attempt: {retryCount}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
