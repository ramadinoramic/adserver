export type ExportFormat = 'png' | 'jpg' | 'gif' | 'html5' | 'mp4';
export type ExportScale = 1 | 2;
export type ExportOrganization = 'platform' | 'size' | 'flat';

export interface ExportConfig {
  format: ExportFormat;
  scale: ExportScale;
  quality?: number; // 0-1 for jpg
  namingPattern: string; // e.g. "{project}_{size}_{variant}"
  organization: ExportOrganization;
  sizes?: string[]; // size keys to export, empty = all
  includeVariants: boolean;
}

export interface ExportJob {
  id: string;
  creativeId: string;
  projectName: string;
  config: ExportConfig;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  files: ExportFile[];
  error?: string;
}

export interface ExportFile {
  name: string;
  path: string;
  size: string; // "300x250"
  format: ExportFormat;
  dataUrl?: string;
  blob?: Blob;
}

export interface NamingTokens {
  project: string;
  creative: string;
  size: string;
  variant: string;
  platform: string;
  date: string;
}
