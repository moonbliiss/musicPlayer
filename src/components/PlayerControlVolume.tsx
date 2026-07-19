import type { CSSProperties, ChangeEvent } from "react";
import ControlIcon from "./ControlIcon";

interface PlayerControlVolumeProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

export default function PlayerControlVolume({
  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
}: PlayerControlVolumeProps) {
  const isSilent = muted || volume === 0;
  const displayedVolume = isSilent ? 0 : volume;
  const progress = Math.min(Math.max(displayedVolume * 100, 0), 100);

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onVolumeChange(Number(event.target.value));
  };

  return (
    <div className="volume-control-bar">
      <button
        className={`icon-button ${isSilent ? "active" : ""}`}
        type="button"
        onClick={onMuteToggle}
        aria-label={isSilent ? "Включить звук" : "Выключить звук"}
        title={isSilent ? "Включить звук" : "Выключить звук"}
      >
        <ControlIcon name={isSilent ? "volume-off" : "volume"} />
      </button>

      <input
        className="volume-input"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={displayedVolume}
        onChange={handleVolumeChange}
        style={{ "--progress": `${progress}%` } as CSSProperties}
        aria-label="Громкость"
      />
    </div>
  );
}
