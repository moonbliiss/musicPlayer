import type {
  FileSystemDirectoryHandle,
  Track,
  WindowWithDirectoryPicker,
} from "../models/types";

const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "flac", "m4a"]);

const getExtension = (fileName: string): string => {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
};

export const isAudioFile = (file: File): boolean => {
  const extension = getExtension(file.name);
  return AUDIO_EXTENSIONS.has(extension);
};

export const supportsDirectoryPicker = (): boolean => {
  return (
    typeof (window as WindowWithDirectoryPicker).showDirectoryPicker ===
    "function"
  );
};

export const createTrackId = (file: File, index: number): string => {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`;
};

export const getFilePath = (file: File): string => {
  const maybeFile = file as File & { webkitRelativePath?: string };
  return maybeFile.webkitRelativePath || file.name;
};

export const fileToTrack = (file: File, index: number): Track => ({
  id: createTrackId(file, index),
  name: file.name.replace(/\.[^/.]+$/, ""),
  file,
  url: URL.createObjectURL(file),
  duration: 0,
  path: getFilePath(file),
});

export const filesToTracks = (files: FileList | File[]): Track[] => {
  return Array.from(files)
    .filter(isAudioFile)
    .sort((a, b) =>
      getFilePath(a).localeCompare(getFilePath(b), undefined, {
        numeric: true,
      }),
    )
    .map(fileToTrack);
};

export const revokeTrackUrls = (tracks: Track[]): void => {
  tracks.forEach((track) => {
    if (track.url.startsWith("blob:")) {
      URL.revokeObjectURL(track.url);
    }
  });
};

export const loadTracksFromServer = async (): Promise<Track[]> => {
  const response = await fetch("http://127.0.0.1:3123/api/tracks");

  if (!response.ok) {
    throw new Error(
      "Не удалось загрузить музыкальную библиотеку с локального сервера.",
    );
  }

  return response.json() as Promise<Track[]>;
};

export const readDirectoryFiles = async (
  directoryHandle: FileSystemDirectoryHandle,
  basePath = directoryHandle.name,
): Promise<File[]> => {
  const files: File[] = [];

  for await (const handle of directoryHandle.values()) {
    if (handle.kind === "file") {
      const file = await handle.getFile();
      Object.defineProperty(file, "webkitRelativePath", {
        value: `${basePath}/${file.name}`,
        configurable: true,
      });
      files.push(file);
    }

    if (handle.kind === "directory") {
      const nestedFiles = await readDirectoryFiles(
        handle,
        `${basePath}/${handle.name}`,
      );
      files.push(...nestedFiles);
    }
  }

  return files;
};

export const pickDirectoryFiles = async (): Promise<File[]> => {
  const picker = (window as WindowWithDirectoryPicker).showDirectoryPicker;

  if (!picker) {
    return [];
  }

  const directoryHandle = await picker();
  return readDirectoryFiles(directoryHandle);
};
