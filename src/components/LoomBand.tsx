import { WovenCloth } from "@designcodeio/threeui/components/WovenCloth";

/**
 * The loom band. The cloth scene itself is a ThreeUI Community component
 * (`WovenCloth`, atelier variant) — the page owns the frame and the copy.
 */
export function LoomBand() {
  return (
    <section className="loom" aria-label="The loom room">
      <div className="loom__stage" data-rv="fade">
        <WovenCloth variant="atelier" className="loom__scene" />
      </div>
      <div className="loom__caption" data-rv="up">
        <span className="eyebrow">The loom room</span>
        <p className="body-lg">
          Every length is washed and rested before a pattern touches it. A
          bolt that has not slept will not cut straight.
        </p>
      </div>
    </section>
  );
}
