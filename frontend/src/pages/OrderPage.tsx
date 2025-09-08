import { GripVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../services/api';

export default function OrderPage() {
  const { '*': folderPathParam } = useParams();
  const navigate = useNavigate();
  const folderPath = (folderPathParam || '').replace(/\\/g, '/');

  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await api.getOrder(folderPath);
        if (isMounted) setLines(data.lines);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [folderPath]);

  // Autosave with debounce
  useEffect(() => {
    const handle = setTimeout(async () => {
      if (loading) return;
      setSaving(true);
      try {
        await api.saveOrder(folderPath, lines);
      } finally {
        setSaving(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [lines, folderPath, loading]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= lines.length) return;
    setLines(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order: {folderPath || 'root'}</h1>
            <p className="text-sm text-gray-500">Drag items to reorder. Changes save automatically.</p>
          </div>
          <div className="text-sm text-gray-500">{saving ? 'Saving…' : 'Saved'}</div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <ul className="space-y-2">
            {lines.map((line, idx) => (
              <li key={line + idx} className="flex items-center bg-white border rounded p-2">
                <button className="p-1 text-gray-500 hover:text-gray-700" onClick={() => move(idx, idx - 1)} title="Move up">▲</button>
                <button className="p-1 text-gray-500 hover:text-gray-700" onClick={() => move(idx, idx + 1)} title="Move down">▼</button>
                <GripVertical className="h-4 w-4 mx-2 text-gray-400" />
                <span className="flex-1 font-mono text-sm">{line}</span>
              </li>
            ))}
          </ul>
          {lines.length === 0 && (
            <p className="text-gray-500">No entries yet. Add markdown files or folders to this directory to order them.</p>
          )}
        </div>
      </main>
    </div>
  );
}
