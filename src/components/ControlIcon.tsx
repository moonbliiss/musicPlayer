type ControlIconName =
  | "play"
  | "pause"
  | "skip-back"
  | "skip-forward"
  | "repeat"
  | "repeat-one"
  | "shuffle"
  | "volume"
  | "volume-off";

interface ControlIconProps {
  name: ControlIconName;
}

export default function ControlIcon({ name }: ControlIconProps) {
  return (
    <svg
      className="control-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {name === "play" ? <polygon points="8 5 19 12 8 19 8 5" /> : null}
      {name === "pause" ? (
        <>
          <line x1="9" y1="5" x2="9" y2="19" />
          <line x1="15" y1="5" x2="15" y2="19" />
        </>
      ) : null}
      {name === "skip-back" ? (
        <>
          <polygon points="19 20 9 12 19 4 19 20" />
          <line x1="5" y1="19" x2="5" y2="5" />
        </>
      ) : null}
      {name === "skip-forward" ? (
        <>
          <polygon points="5 4 15 12 5 20 5 4" />
          <line x1="19" y1="5" x2="19" y2="19" />
        </>
      ) : null}
      {name === "repeat" || name === "repeat-one" ? (
        <>
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          {name === "repeat-one" ? (
            <path d="M12 9v6" className="control-icon-accent" />
          ) : null}
        </>
      ) : null}
      {name === "shuffle" ? (
        <>
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </>
      ) : null}
      {name === "volume" || name === "volume-off" ? (
        <>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          {name === "volume" ? (
            <>
              <path d="M15 9.5a4 4 0 0 1 0 5" />
              <path d="M18 6a8 8 0 0 1 0 12" />
            </>
          ) : (
            <>
              <line x1="16" y1="9" x2="22" y2="15" />
              <line x1="22" y1="9" x2="16" y2="15" />
            </>
          )}
        </>
      ) : null}
    </svg>
  );
}
