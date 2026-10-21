import { ClothStudy } from "@designcodeio/threeui/components/ClothStudy";
import { STATS } from "../data/collection";

export function ChapterCutting() {
  return (
    <section className="sec" id="cutting" data-chapter="cutting">
      <div className="sec__head" data-rv="fade">
        <span className="sec__kicker">
          <b>01</b> — The Cutting Room
        </span>
        <span className="sec__rule" />
        <span className="sec__kicker">Mills</span>
      </div>

      <div className="cutting__grid">
        <h2 className="display display--sec" data-rv="up">
          Long fibre, slow loom, cloth that outlives the season.
        </h2>
        <div className="cutting__copy">
          <p className="lead" data-rv="up">
            Every length we cut comes from a mill we can name. The wool is
            carded by a family works in Biella that has been at it for a
            hundred and forty years; the linen comes from a flax grower
            outside Kortrijk who sends us a harvest, not a catalogue.
          </p>
          <p className="body" data-rv="up">
            We buy the whole roll or none of it. What arrives is washed, rested
            for a week, and measured against the pattern before a single line
            is cut — so a coat that sits still in a warm room still keeps its
            shape when the sea wind gets in.
          </p>
          <a className="arrowlink" href="#collection" data-rv="fade">
            <span>Enter the cutting room</span>
            <span className="arrowlink__arrow" aria-hidden="true">
              <svg viewBox="0 0 14 14" fill="none">
                <path d="M3 11 11 3M5 3h6v6" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </span>
          </a>
        </div>
      </div>

      <div className="cutting__stats" data-rv="up">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <b>{stat.value}</b>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="study" data-rv="up">
        <div className="study__plate">
          <ClothStudy mode="dark" opacity={0.78} scale={2.05} />
        </div>
        <div className="study__caption">
          <span className="eyebrow">Material study</span>
          <p className="body">
            Plain weave, 2/1 twill, 280 grams. We keep a card of every length
            we buy, with the mill's name and the week it was woven. When a
            batch runs out, the next one is not the same — and that is the
            point.
          </p>
        </div>
      </div>
    </section>
  );
}
