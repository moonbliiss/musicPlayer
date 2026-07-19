import type { Track } from "../models/types";
import FolderPicker from "./FolderPicker";
import type { Playlist } from "../models/types";

interface Props {
  page: "allMusic" | "favoriteMusic" | `playlist:${string}`;
  playlists: Playlist[];
  onNavigate: (
    page: "allMusic" | "favoriteMusic" | `playlist:${string}`,
  ) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onCreatePlaylistClick: () => void;

  onTracksLoaded: (tracks: Track[]) => void;
  onError: (message: string) => void;
}

export default function Sidebar({
  page,
  onNavigate,
  playlists,
  onDeletePlaylist,
  onCreatePlaylistClick,

  onTracksLoaded,
  onError,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="my-music">
        <div className="my-music-title">Моя медиатека</div>

        <div className="my-music-nav">
          <button
            className={`my-music-nav-btn${page === "allMusic" ? " active" : ""}`}
            onClick={() => onNavigate("allMusic")}
          >
            Все песни
          </button>

          <button
            className={`my-music-nav-btn${page === "favoriteMusic" ? " active" : ""}`}
            onClick={() => onNavigate("favoriteMusic")}
          >
            Любимые треки
          </button>
        </div>
      </div>

      <div className="playlist">
        <div className="my-playlist-list">
          {playlists.length === 0 ? (
            <span className="playlist-empty">Плейлистов пока нет</span>
          ) : (
            playlists.map((playlist) => (
              <div
                className={`playlist-card${page === `playlist:${playlist.id}` ? " active" : ""}`}
                key={playlist.id}
              >
                <button
                  className="playlist-open"
                  type="button"
                  onClick={() => onNavigate(`playlist:${playlist.id}`)}
                >
                  <span className="card-name">{playlist.name}</span>
                </button>

                <button
                  className="card-delete"
                  type="button"
                  aria-label={`Удалить плейлист ${playlist.name}`}
                  onClick={() => {
                    const shouldDelete = window.confirm(
                      `Удалить плейлист "${playlist.name}"?`,
                    );

                    if (shouldDelete) {
                      onDeletePlaylist(playlist.id);
                    }
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <button className="add-playlist-btn" onClick={onCreatePlaylistClick}>
          Новый плейлист
        </button>
      </div>

      <div className="folder-picker">
        <FolderPicker onTracksLoaded={onTracksLoaded} onError={onError} />
      </div>
    </aside>
  );
}
