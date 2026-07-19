import { useRef } from "react";
import type { ChangeEvent } from "react";
import {
  filesToTracks,
  loadTracksFromServer,
  pickDirectoryFiles,
  supportsDirectoryPicker,
} from "../utils/audioFiles";
import type { Track } from "../models/types";

interface FolderPickerProps {
  onTracksLoaded: (tracks: Track[]) => void;
  onError: (message: string) => void;
}

export default function FolderPicker({
  onTracksLoaded,
  onError,
}: FolderPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleServerLibrary = async (): Promise<void> => {
    try {
      const tracks = await loadTracksFromServer();
      onTracksLoaded(tracks);
    } catch {
      onError(
        "Не удалось загрузить музыку с локального сервера. Проверьте, что запущен npm run server.",
      );
    }
  };

  const handleDirectoryPicker = async (): Promise<void> => {
    try {
      if (!supportsDirectoryPicker()) {
        inputRef.current?.click();
        return;
      }

      const files = await pickDirectoryFiles();
      onTracksLoaded(filesToTracks(files));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      onError(
        "Не удалось открыть папку. Попробуйте выбрать файлы другим способом.",
      );
    }
  };

  const handleFallbackChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { files } = event.target;

    if (!files) {
      return;
    }

    onTracksLoaded(filesToTracks(files));
    event.target.value = "";
  };

  return (
    <div className="folder-picker">
      <button
        className="add-folder-btn"
        type="button"
        onClick={handleServerLibrary}
      >
        Загрузить библиотеку
      </button>

      <div className="text-or">
        -------------------- или --------------------
      </div>

      <button
        className="add-folder-btn"
        type="button"
        onClick={handleDirectoryPicker}
      >
        Выбрать папку
      </button>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept=".mp3,.wav,.ogg,.flac,.m4a,audio/*"
        multiple
        onChange={handleFallbackChange}
        webkitdirectory=""
      />
    </div>
  );
}
