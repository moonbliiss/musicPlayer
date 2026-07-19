import type { CSSProperties } from "react";

interface SpeedControlProps {
  value: number;
  onChange: (speed: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function PlayerControlSpeed({
  value,
  onChange,
  min = 0.5,
  max = 2,
  step = 0.1,
}: SpeedControlProps) {
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="speed-control">
      <span className="speed-label">Скорость</span>
      <input
        className="speed-input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--progress": `${progress}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Скорость воспроизведения"
      />
      <span className="speed-value">{value.toFixed(1)}x</span>
    </div>
  );
}
