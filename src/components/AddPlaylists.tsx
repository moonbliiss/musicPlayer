import { useState, useEffect } from "react";
import type { Track } from "../models/types";
import { formatTime } from "./PlayerControlProgress";

interface Props {
  tracks: Track[];
  onCreatePlaylist: (name: string, trackIds: string[]) => void;
  onClose: () => void;
}

export default function AddPlaylists({
  tracks,
  onCreatePlaylist,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  const toggleTrack = (trackId: string): void => {
    setSelectedTrackIds((currentIds) =>
      currentIds.includes(trackId)
        ? currentIds.filter((id) => id !== trackId)
        : [...currentIds, trackId],
    );
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <input
          autoFocus
          className="modal-input"
          value={name}
          onChange={(event) => setName(event.target.value)}

          placeholder="Название"
          maxLength={60}
        />

        <div className="playlist-track-picker">
          {tracks.map((track) => (
            <label key={track.id} className={`track-row`}>
              <input
                type="checkbox"
                checked={selectedTrackIds.includes(track.id)}
                onChange={() => toggleTrack(track.id)}
              />
              <span className="track-title">{track.name}</span>
              <span className="track-artist">{track.artist || "—"}</span>
              <span className="track-duration">
                {track.duration > 0 ? formatTime(track.duration) : "--:--"}
              </span>
            </label>
          ))}
        </div>

        <div className="modal-action">
          <button
            className="modal-submit"
            type="button"
            onClick={() => {
              onCreatePlaylist(name, selectedTrackIds);
              onClose();
            }}
          >
            Создать
          </button>

          <button className="modal-cancel" type="button" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
