import type { Track } from "../models/types";

interface PlayerControlMetadataProps {
  tracks: Track[];
  activeTrackId?: string;
}

export default function PlayerControlMetadata({
  tracks,
  activeTrackId,
}: PlayerControlMetadataProps) {
  return (
    <div>
      {tracks.map((track) => {
        const isActive = track.id === activeTrackId;
        if (isActive)
          return (
            <div key={track.id}>
              <div>{track.name}</div>
              <div>{track.artist || ""}</div>
            </div>
          );
      })}
    </div>
  );
}
