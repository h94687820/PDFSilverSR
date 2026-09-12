import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { AppSettings, DocumentRecord, IconTone, NotebookRecord, PageRecord, ThemeMode } from '@/types/library';

const STORAGE_KEY = '@pdfsilversr/state-v1';

interface StoredState {
  documents: DocumentRecord[];
  notebooks: NotebookRecord[];
  settings: AppSettings;
}

interface AppContextValue extends StoredState {
  isReady: boolean;
  importPdf: () => Promise<void>;
  importImagesAsPdf: () => Promise<void>;
  appendImagesToDocument: (documentId: string) => Promise<void>;
  updateDocument: (document: DocumentRecord | ((current: DocumentRecord) => DocumentRecord)) => void;
  deleteAllData: () => Promise<void>;
  addNotebook: () => NotebookRecord;
  updateNotebook: (notebook: NotebookRecord) => void;
  deleteNotebook: (id: string) => void;
  setTheme: (theme: ThemeMode) => void;
  setIconTone: (tone: IconTone) => void;
  setZoomLocked: (locked: boolean) => void;
}

const defaultState: StoredState = {
  documents: [],
  notebooks: [
    {
      id: 'welcome-note',
      title: 'Welcome to your notebook',
      body: 'A quiet place for ideas, reading notes, and loose thoughts.\n\nEverything stays on this device.',
      updatedAt: Date.now(),
    },
  ],
  settings: { theme: 'system', iconTone: 'amber', zoomLocked: false },
};

const AppContext = createContext<AppContextValue | null>(null);

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function copyImageToAppStorage(uri: string) {
  const localDir = `${FileSystem.documentDirectory}pdfsilversr/images/`;
  const sourceExtension = uri.split('?')[0].split('.').pop()?.toLowerCase();
  const extension = sourceExtension && /^[a-z0-9]{2,5}$/.test(sourceExtension) ? sourceExtension : 'jpg';
  const localUri = `${localDir}${makeId('image')}.${extension}`;
  await FileSystem.makeDirectoryAsync(localDir, { intermediates: true });
  await FileSystem.copyAsync({ from: uri, to: localUri });
  return localUri;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(defaultState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as StoredState;
          setState({
            documents: parsed.documents ?? [],
            notebooks: parsed.notebooks ?? defaultState.notebooks,
            settings: { ...defaultState.settings, ...parsed.settings },
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
    }
  }, [isReady, state]);

  const importPdf = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const localDir = `${FileSystem.documentDirectory}pdfsilversr/`;
    const localUri = `${localDir}${makeId('pdf')}-${asset.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    try {
      await FileSystem.makeDirectoryAsync(localDir, { intermediates: true });
      await FileSystem.copyAsync({ from: asset.uri, to: localUri });
    } catch {
      Alert.alert('Could not import PDF', 'The selected file could not be copied into local storage.');
      return;
    }

    const now = Date.now();
    const record: DocumentRecord = {
      id: makeId('document'),
      name: asset.name,
      uri: localUri,
      mimeType: asset.mimeType ?? 'application/pdf',
      size: asset.size,
      pages: [{ id: makeId('page'), kind: 'pdf' }],
      createdAt: now,
      lastOpenedAt: now,
    };
    setState((current) => ({ ...current, documents: [record, ...current.documents] }));
  }, []);

  const importImagesAsPdf = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (result.canceled || !result.assets.length) return;

    let pages: PageRecord[];
    try {
      pages = await Promise.all(result.assets.map(async (asset) => ({
        id: makeId('page'),
        kind: 'image' as const,
        imageUri: await copyImageToAppStorage(asset.uri),
      })));
    } catch {
      Alert.alert('Could not import images', 'The selected images could not be copied into local storage.');
      return;
    }
    const now = Date.now();
    const record: DocumentRecord = {
      id: makeId('document'),
      name: `Image collection · ${new Date(now).toLocaleDateString()}`,
      uri: pages[0]?.imageUri ?? '',
      mimeType: 'application/pdf',
      pages,
      createdAt: now,
      lastOpenedAt: now,
    };
    setState((current) => ({ ...current, documents: [record, ...current.documents] }));
  }, []);

  const updateDocument = useCallback((documentOrUpdater: DocumentRecord | ((current: DocumentRecord) => DocumentRecord)) => {
    setState((current) => ({
      ...current,
      documents: current.documents.map((item) => {
        const next = typeof documentOrUpdater === 'function' ? documentOrUpdater(item) : documentOrUpdater;
        return next.id === item.id ? next : item;
      }),
    }));
  }, []);

  const appendImagesToDocument = useCallback(async (documentId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (result.canceled || !result.assets.length) return;
    let pages: PageRecord[];
    try {
      pages = await Promise.all(result.assets.map(async (asset) => ({
        id: makeId('page'),
        kind: 'image' as const,
        imageUri: await copyImageToAppStorage(asset.uri),
      })));
    } catch {
      Alert.alert('Could not import images', 'The selected images could not be copied into local storage.');
      return;
    }
    setState((current) => ({
      ...current,
      documents: current.documents.map((item) => item.id === documentId ? { ...item, pages: [...item.pages, ...pages] } : item),
    }));
  }, []);

  const deleteAllData = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState({ documents: [], notebooks: [], settings: defaultState.settings });
  }, []);

  const addNotebook = useCallback(() => {
    const notebook: NotebookRecord = {
      id: makeId('note'),
      title: 'Untitled note',
      body: '',
      updatedAt: Date.now(),
    };
    setState((current) => ({ ...current, notebooks: [notebook, ...current.notebooks] }));
    return notebook;
  }, []);

  const updateNotebook = useCallback((notebook: NotebookRecord) => {
    setState((current) => ({
      ...current,
      notebooks: current.notebooks.map((item) => (item.id === notebook.id ? notebook : item)),
    }));
  }, []);

  const deleteNotebook = useCallback((id: string) => {
    setState((current) => ({ ...current, notebooks: current.notebooks.filter((item) => item.id !== id) }));
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    ...state,
    isReady,
    importPdf,
    importImagesAsPdf,
    appendImagesToDocument,
    updateDocument,
    deleteAllData,
    addNotebook,
    updateNotebook,
    deleteNotebook,
    setTheme: (theme) => setState((current) => ({ ...current, settings: { ...current.settings, theme } })),
    setIconTone: (iconTone) => setState((current) => ({ ...current, settings: { ...current.settings, iconTone } })),
    setZoomLocked: (zoomLocked) => setState((current) => ({ ...current, settings: { ...current.settings, zoomLocked } })),
  }), [state, isReady, importPdf, importImagesAsPdf, updateDocument, deleteAllData, addNotebook, updateNotebook, deleteNotebook]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}

export function useResolvedTheme() {
  const { settings } = useApp();
  return settings.theme;
}

export async function createPdfFromHtml(html: string) {
  return Print.printToFileAsync({ html });
}