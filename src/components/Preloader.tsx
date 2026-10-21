type PreloaderProps = {
  progress: number;
  done: boolean;
};

export function Preloader({ progress, done }: PreloaderProps) {
  const percent = Math.min(100, Math.round(progress * 100));

  return (
    <div className={`preloader${done ? " is-done" : ""}`} aria-hidden={done}>
      <div className="preloader__inner">
        <div className="preloader__mark" aria-hidden="true">
          <svg viewBox="0 0 44 44" fill="none">
            <path d="M22 4v36M9 9h26M9 9 4 17h10zM35 9l5 8H30z" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="22" cy="30" r="3.4" fill="currentColor" />
          </svg>
        </div>
        <p className="preloader__word">SERA</p>
        <div className="preloader__bar">
          <i style={{ right: `${100 - percent}%` }} />
        </div>
        <div className="preloader__meta">
          <span>Opening the studio</span>
          <b>{percent}%</b>
        </div>
      </div>
    </div>
  );
}
