import { useEffect, useState } from "react";
import type { Playlist, Track } from "../models/types";
import { formatTime } from "./PlayerControlProgress";

interface TrackListProps {
  tracks: Track[];
  activeTrackId?: string;
  favoriteTrackIds: string[];
  playlists: Playlist[];
  onSelectTrack: (trackId: string) => void;
  onToggleFavorite: (trackId: string) => void;
  onAddTrackToPlaylist: (playlistId: string, trackId: string) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  track: Track;
}

export default function TrackList({
  tracks,
  activeTrackId,
  onSelectTrack,
  favoriteTrackIds,
  playlists,
  onAddTrackToPlaylist,
  onToggleFavorite,
}: TrackListProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    const closeMenu = (): void => setContextMenu(null);
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("click", closeMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu]);

  if (tracks.length === 0) {
    return (
      <section className="empty-state">
        <h2>Библиотека пуста</h2>
        <p>Запустите локальный сервер или выберите папку с аудиофайлами.</p>
      </section>
    );
  }

  return (
    <section className="track-list" aria-label="Список треков">
      <div className="track-table-header">
        <span>Название</span>
        <span>Исполнитель</span>
        <span>Альбом</span>
        <span className="track-duration-heading">Длительность</span>
      </div>

      {tracks.map((track) => {
        const isActive = track.id === activeTrackId;

        return (
          <button
            className={`track-row ${isActive ? "active" : ""}`}
            key={track.id}
            type="button"
            onClick={() => onSelectTrack(track.id)}
            onContextMenu={(event) => {
              event.preventDefault();
              setContextMenu({
                x: event.clientX,
                y: event.clientY,
                track,
              });
            }}
          >
            <span className="track-title">{track.name}</span>
            <span className="track-artist">{track.artist || "—"}</span>
            <span className="track-album">{track.album || "—"}</span>
            <span className="track-duration">
              {track.duration > 0 ? formatTime(track.duration) : "--:--"}
            </span>
          </button>
        );
      })}

      {contextMenu ? (
        <div
          className="track-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="track-context-menu-item"
            onClick={() => {
              onToggleFavorite(contextMenu.track.id);
              setContextMenu(null);
            }}
          >
            {favoriteTrackIds.includes(contextMenu.track.id)
              ? "Убрать из избранного"
              : "Добавить в избранное"}
          </button>

          <div className="track-context-menu-group">
            <button type="button" className="track-context-menu-item">
              Добавить в плейлист
            </button>

            <div className="track-context-submenu">
              {playlists.length === 0 ? (
                <div className="track-context-empty">Нет плейлистов</div>
              ) : (
                playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    className="track-context-menu-item"
                    disabled={playlist.trackIds.includes(contextMenu.track.id)}
                    onClick={() => {
                      onAddTrackToPlaylist(playlist.id, contextMenu.track.id);
                      setContextMenu(null);
                    }}
                  >
                    {playlist.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
