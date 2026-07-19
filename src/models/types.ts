export interface Track {
  id: string;
  name: string;
  artist?: string;
  album?: string;
  file?: File;
  url: string;
  duration: number;
  path: string;
  size?: number;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}

export type RepeatMode = "off" | "one" | "all";

export interface FileSystemDirectoryHandle {
  kind: "directory";
  name: string;
  values(): AsyncIterable<FileSystemHandle>;
}

export interface FileSystemFileHandle {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
}

export type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle;

export interface WindowWithDirectoryPicker extends Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
}
