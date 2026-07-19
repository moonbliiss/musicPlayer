import type { CSSProperties, ChangeEvent } from "react";

interface PlayerControlProgressProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
};

export default function PlayerControlProgress({
  currentTime,
  duration,
  onSeek,
}: PlayerControlProgressProps) {
  const safeDuration = Number.isFinite(duration) ? duration : 0;
  const progress = safeDuration > 0 ? (currentTime / safeDuration) * 100 : 0;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onSeek(Number(event.target.value));
  };

  return (
    <div className="progress-wrap">
      <span className="current-time-on-progress-bar">
        {formatTime(currentTime)}
      </span>

      <input
        className="progress-input"
        type="range"
        min="0"
        max={safeDuration || 0}
        step="0.1"
        value={Math.min(currentTime, safeDuration || currentTime)}
        onChange={handleChange}
        style={{ "--progress": `${progress}%` } as CSSProperties}
        aria-label="Прогресс трека"
      />

      <span className="safe-duration-on-progress-bar">
        {formatTime(safeDuration)}
      </span>
    </div>
  );
}

export { formatTime };
