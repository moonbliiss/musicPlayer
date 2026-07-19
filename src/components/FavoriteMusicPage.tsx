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

export default function FavoriteMusicPage({
  tracks,
  activeTrackId,
  favoriteTrackIds,
  playlists,
  onSelectTrack,
  onToggleFavorite,
  onAddTrackToPlaylist,
}: Props) {
  const favoriteTracks = tracks.filter((track) =>
    favoriteTrackIds.includes(track.id),
  );

  return (
    <TrackList
      tracks={favoriteTracks}
      activeTrackId={activeTrackId}
      favoriteTrackIds={favoriteTrackIds}
      playlists={playlists}
      onSelectTrack={onSelectTrack}
      onToggleFavorite={onToggleFavorite}
      onAddTrackToPlaylist={onAddTrackToPlaylist}
    />
  );
}
