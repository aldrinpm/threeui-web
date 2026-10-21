import { CHAPTER_LINKS } from "../data/collection";

type HeroProps = {
  activeChapter: string;
};

export function Hero({ activeChapter }: HeroProps) {
  return (
    <section className="hero" id="hero" data-chapter="hero">
      <div className="hero__top">
        <p className="eyebrow" data-rv="fade">
          <span className="eyebrow__dot" />
          Chapter 00 — The Cutting Room
        </p>
        <h1 className="display display--hero">
          <span className="mask-line">
            <span>Cloth that</span>
          </span>
          <span className="mask-line">
            <span>remembers</span>
          </span>
          <span className="mask-line">
            <span>the hand.</span>
          </span>
        </h1>
        <p className="hero__sub body" data-rv="up">
          A small atelier in Porto. Twelve mills, six machinists, and one rule:
          every garment is cut for a decade of wear, never for a season.
        </p>
      </div>

      <div className="hero__spacer" />

      <div className="hero__foot">
        <p className="hero__cue" data-rv="fade">
          <span>Scroll to enter</span>
          <span className="hero__track">
            <i />
          </span>
        </p>

        <div className="chapters" id="chips">
          {CHAPTER_LINKS.map((chapter, index) => (
            <a
              className={`chip${activeChapter === chapter.id ? " is-active" : ""}`}
              href={chapter.target}
              key={chapter.id}
              data-rv="up"
              data-rv-delay={index * 90}
            >
              <span className="num">{String(index + 1).padStart(2, "0")}</span>
              <span className="chip__text">
                <b>{chapter.title}</b>
                <p>{chapter.blurb}</p>
              </span>
            </a>
          ))}
        </div>
      </div>

      <a
        className="peek"
        href="#rail"
        aria-label="Preview: the studio rail, before the first stitch"
        data-rv="fade"
      >
        <span className="peek__frame" data-frame data-view="3">
          <span className="peek__scrim" aria-hidden="true" />
          <span className="peek__caption">
            <b>The Rail</b>
            <i>Before the first stitch</i>
          </span>
        </span>
        <span className="peek__play" aria-hidden="true">
          <svg viewBox="0 0 22 22" fill="none">
            <path d="M8 5.6 16.4 11 8 16.4z" fill="currentColor" />
          </svg>
        </span>
      </a>

      <div className="hero__side" data-rv="up">
        <span>EST. 2014 · PORTO</span>
      </div>
    </section>
  );
}
