import type { RepeatMode } from "../models/types";
import ControlIcon from "./ControlIcon";

interface PlayerControlButtonProps {
  isPlaying: boolean;
  hasTracks: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRepeatChange: () => void;
  onShuffleToggle: () => void;
}

const repeatLabels: Record<RepeatMode, string> = {
  off: "Повтор выключен",
  one: "Повтор одного трека",
  all: "Повтор всех треков",
};

export default function PlayerControlButton({
  isPlaying,
  hasTracks,
  repeatMode,
  shuffle,
  onPlayPause,
  onPrevious,
  onNext,
  onRepeatChange,
  onShuffleToggle,
}: PlayerControlButtonProps) {
  return (
    <div className="main-controls">
      <button
        className={`icon-button mode-button ${repeatMode !== "off" ? "active" : ""}`}
        type="button"
        onClick={onRepeatChange}
        disabled={!hasTracks}
        aria-label={repeatLabels[repeatMode]}
        title={repeatLabels[repeatMode]}
      >
        <ControlIcon name={repeatMode === "one" ? "repeat-one" : "repeat"} />
      </button>

      <button
        className="icon-button"
        type="button"
        onClick={onPrevious}
        disabled={!hasTracks}
        aria-label="Предыдущий трек"
        title="Предыдущий трек"
      >
        <ControlIcon name="skip-back" />
      </button>

      <button
        className="play-button"
        type="button"
        onClick={onPlayPause}
        disabled={!hasTracks}
        aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
        title={isPlaying ? "Пауза" : "Воспроизвести"}
      >
        <ControlIcon name={isPlaying ? "pause" : "play"} />
      </button>

      <button
        className="icon-button"
        type="button"
        onClick={onNext}
        disabled={!hasTracks}
        aria-label="Следующий трек"
        title="Следующий трек"
      >
        <ControlIcon name="skip-forward" />
      </button>

      <button
        className={`icon-button mode-button ${shuffle ? "active" : ""}`}
        type="button"
        onClick={onShuffleToggle}
        disabled={!hasTracks}
        aria-label={shuffle ? "Перемешивание включено" : "Перемешивание выключено"}
        title={shuffle ? "Перемешивание включено" : "Перемешивание выключено"}
      >
        <ControlIcon name="shuffle" />
      </button>
    </div>
  );
}
