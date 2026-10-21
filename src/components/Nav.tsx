import { useEffect, useState } from "react";
import { CHAPTER_LINKS } from "../data/collection";

type NavProps = {
  bagCount: number;
  onOpenBag: () => void;
};

export function Nav({ bagCount, onOpenBag }: NavProps) {
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setStuck(y > 24);
      setHidden(y > 240 && y > lastY + 4);
      setLastY(y);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [lastY]);

  useEffect(() => {
    document.body.classList.toggle("is-locked", open);
    return () => document.body.classList.remove("is-locked");
  }, [open]);

  return (
    <header
      className={`nav${stuck ? " is-stuck" : ""}${hidden ? " is-hidden" : ""}`}
      id="nav"
    >
      <a className="brand" href="#top" aria-label="SERA, back to the top">
        <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <path d="M22 5v34M9 10h26M9 10 4 18h10zM35 10l5 8H30z" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="22" cy="31" r="3.6" fill="currentColor" />
        </svg>
        <span className="brand__text">
          <b>SERA</b>
          <i>ATELIER OF SLOW CLOTH</i>
        </span>
      </a>

      <nav className="nav__links" aria-label="Chapters">
        {CHAPTER_LINKS.map((chapter) => (
          <a className="nav__link" href={chapter.target} key={chapter.id}>
            <span>{chapter.label}</span>
            <span className="nav__alt">{chapter.alt}</span>
          </a>
        ))}
      </nav>

      <button className="nav__bag" type="button" onClick={onOpenBag}>
        Bag{bagCount > 0 ? ` (${bagCount})` : ""}
      </button>

      <button
        className={`nav__burger${open ? " is-open" : ""}`}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <i />
        <i />
      </button>

      <div className={`nav__sheet${open ? " is-open" : ""}`}>
        {CHAPTER_LINKS.map((chapter) => (
          <a
            href={chapter.target}
            key={chapter.id}
            onClick={() => setOpen(false)}
          >
            <span>{chapter.label}</span>
            <em>{chapter.alt}</em>
          </a>
        ))}
        <button type="button" className="nav__sheet-bag" onClick={onOpenBag}>
          Open the bag ({bagCount})
        </button>
      </div>
    </header>
  );
}
