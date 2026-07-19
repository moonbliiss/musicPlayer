import type { RepeatMode } from "../models/types";
import type { Track } from "../models/types";
import PlayerControlMetadata from "./PlayerControlMetadata";
import PlayerControlButton from "./PlayerControlButton";
import PlayerControlProgress from "./PlayerControlProgress";
import PlayerControlVolume from "./PlayerControlVolume";
import PlayerControlSpeed from "./PlayerControlSpeed";

interface PlayerControlProps {
  /* PlayerControlMetadataProps-----------------*/
  tracks: Track[];
  activeTrackId?: string;

  /* PlayerControlButtonProps-------------------*/
  isPlaying: boolean;
  hasTracks: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRepeatChange: () => void;
  onShuffleToggle: () => void;

  /* PlayerControlProgressProps------------------*/
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;

  /* PlayerControlVolumeProps--------------------*/
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;

  playbackRate: number;
  onPlaybackRateChange: (playbackRate: number) => void;
}

export default function PlayerControl({
  tracks,
  activeTrackId,

  isPlaying,
  hasTracks,
  repeatMode,
  shuffle,
  onPlayPause,
  onPrevious,
  onNext,
  onRepeatChange,
  onShuffleToggle,

  currentTime,
  duration,
  onSeek,

  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
  playbackRate,
  onPlaybackRateChange,
}: PlayerControlProps) {
  return (
    <div className="player-control-bar">
      <div className="MetadataControl-on-PlayerControlBar">
        <PlayerControlMetadata tracks={tracks} activeTrackId={activeTrackId} />
      </div>

      <div className="PlayerControls-on-PlayerControlBar">
        <PlayerControlButton
          isPlaying={isPlaying}
          hasTracks={hasTracks}
          repeatMode={repeatMode}
          shuffle={shuffle}
          onPlayPause={onPlayPause}
          onPrevious={onPrevious}
          onNext={onNext}
          onRepeatChange={onRepeatChange}
          onShuffleToggle={onShuffleToggle}
        />
      </div>

      <div className="ProgressBar-on-PlayerControlBar">
        <PlayerControlProgress
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />
      </div>

      <div className="VolumeControl-on-PlayerControlBar">
        <PlayerControlVolume
          volume={volume}
          muted={muted}
          onVolumeChange={onVolumeChange}
          onMuteToggle={onMuteToggle}
        />
      </div>

      <div className="SpeedControl-on-PlayerControlBar">
        <PlayerControlSpeed
          value={playbackRate}
          onChange={onPlaybackRateChange}
          min={0.5}
          max={2.5}
          step={0.1}
        />
      </div>
    </div>
  );
}
