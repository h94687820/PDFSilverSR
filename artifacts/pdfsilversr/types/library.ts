export type ThemeMode = 'system' | 'light' | 'dark';
export type IconTone = 'amber' | 'blue' | 'sage';

export type PageKind = 'pdf' | 'blank' | 'image';

export interface PageRecord {
  id: string;
  kind: PageKind;
  imageUri?: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  uri: string;
  mimeType: string;
  size?: number;
  pages: PageRecord[];
  createdAt: number;
  lastOpenedAt: number;
}

export interface NotebookRecord {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

export interface AppSettings {
  theme: ThemeMode;
  iconTone: IconTone;
  zoomLocked: boolean;
}