import type { Playlist, Track } from "../models/types";
import TrackList from "./TrackList";

interface Props {
  tracks: Track[];
  activeTrackId?: string;
  favoriteTrackIds: string[];
  playlists: Playlist[];
  onSelectTrack: (trackId: string) => void;
  onToggleFavorite: (trackId: string) => void;
  onAddTrackToPlaylist: (playlistId: string, trackId: string) => void;
}

export default function AllMusicPage({
  tracks,
  activeTrackId,
  favoriteTrackIds,
  playlists,
  onSelectTrack,
  onToggleFavorite,
  onAddTrackToPlaylist,
}: Props) {
  return (
    <div>
      <TrackList
        tracks={tracks}
        activeTrackId={activeTrackId}
        favoriteTrackIds={favoriteTrackIds}
        playlists={playlists}
        onSelectTrack={onSelectTrack}
        onToggleFavorite={onToggleFavorite}
        onAddTrackToPlaylist={onAddTrackToPlaylist}
      />
    </div>
  );
}
