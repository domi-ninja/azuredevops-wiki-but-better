import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import * as wikiApi from '../services/api';
import { WikiConfig, WikiPage, WikiStructure } from '../types/wiki';

interface WikiState {
  structure: WikiStructure | null;
  currentPage: WikiPage | null;
  config: WikiConfig | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
}

type WikiAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STRUCTURE'; payload: WikiStructure }
  | { type: 'SET_CURRENT_PAGE'; payload: WikiPage | null }
  | { type: 'SET_CONFIG'; payload: WikiConfig }
  | { type: 'SET_EDITING'; payload: boolean };

const initialState: WikiState = {
  structure: null,
  currentPage: null,
  config: null,
  loading: false,
  error: null,
  isEditing: false,
};

function wikiReducer(state: WikiState, action: WikiAction): WikiState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_STRUCTURE':
      return { ...state, structure: action.payload, loading: false, error: null };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload, loading: false, error: null };
    case 'SET_CONFIG':
      return { ...state, config: action.payload, loading: false, error: null };
    case 'SET_EDITING':
      return { ...state, isEditing: action.payload };
    default:
      return state;
  }
}

interface WikiContextType {
  state: WikiState;
  loadStructure: () => Promise<void>;
  loadPage: (path: string) => Promise<void>;
  savePage: (path: string, content: string, metadata?: Record<string, any>) => Promise<void>;
  createPage: (path: string, title: string, content?: string) => Promise<void>;
  deletePage: (path: string) => Promise<void>;
  loadConfig: () => Promise<void>;
  updateConfig: (config: Partial<WikiConfig>) => Promise<void>;
  setEditing: (editing: boolean) => void;
}

const WikiContext = createContext<WikiContextType | undefined>(undefined);

export function WikiProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wikiReducer, initialState);

  const loadStructure = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const structure = await wikiApi.getWikiStructure();
      dispatch({ type: 'SET_STRUCTURE', payload: structure });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load wiki structure' });
    }
  }, []);

  const loadPage = useCallback(async (path: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const page = await wikiApi.getPage(path);
      dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load page' });
    }
  }, []);

  const savePage = useCallback(async (path: string, content: string, metadata?: Record<string, any>) => {
    try {
      await wikiApi.savePage(path, content, metadata);
      // Reload the page to get updated content
      await loadPage(path);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to save page' });
      throw error;
    }
  }, [loadPage]);

  const createPage = useCallback(async (path: string, title: string, content = '') => {
    try {
      await wikiApi.createPage(path, title, content);
      // Reload structure to show new page
      await loadStructure();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create page' });
      throw error;
    }
  }, [loadStructure]);

  const deletePage = useCallback(async (path: string) => {
    try {
      await wikiApi.deletePage(path);
      // Reload structure to remove deleted page
      await loadStructure();
      // Clear current page if it was deleted
      if (state.currentPage?.path === path) {
        dispatch({ type: 'SET_CURRENT_PAGE', payload: null });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete page' });
      throw error;
    }
  }, [loadStructure, state.currentPage?.path]);

  const loadConfig = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const config = await wikiApi.getConfig();
      dispatch({ type: 'SET_CONFIG', payload: config });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load configuration' });
    }
  }, []);

  const updateConfig = useCallback(async (configUpdate: Partial<WikiConfig>) => {
    try {
      const config = await wikiApi.updateConfig(configUpdate);
      dispatch({ type: 'SET_CONFIG', payload: config });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update configuration' });
      throw error;
    }
  }, []);

  const setEditing = useCallback((editing: boolean) => {
    dispatch({ type: 'SET_EDITING', payload: editing });
  }, []);

  // Load initial data
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const contextValue: WikiContextType = useMemo(
    () => ({
      state,
      loadStructure,
      loadPage,
      savePage,
      createPage,
      deletePage,
      loadConfig,
      updateConfig,
      setEditing,
    }),
    [
      state,
      loadStructure,
      loadPage,
      savePage,
      createPage,
      deletePage,
      loadConfig,
      updateConfig,
      setEditing,
    ]
  );

  return (
    <WikiContext.Provider value={contextValue}>
      {children}
    </WikiContext.Provider>
  );
}

export function useWiki() {
  const context = useContext(WikiContext);
  if (context === undefined) {
    throw new Error('useWiki must be used within a WikiProvider');
  }
  return context;
}
