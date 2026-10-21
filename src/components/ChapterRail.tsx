import { CARD_PRODUCTS, CURRENCY } from "../data/collection";

type ChapterRailProps = {
  onAdd: (id: string) => void;
};

export function ChapterRail({ onAdd }: ChapterRailProps) {
  return (
    <section className="sec" id="rail" data-chapter="rail">
      <div className="sec__head" data-rv="fade">
        <span className="sec__kicker">
          <b>02</b> — The Rail
        </span>
        <span className="sec__rule" />
        <span className="sec__kicker">Studio</span>
      </div>

      <div className="cards">
        {CARD_PRODUCTS.map((product, index) => (
          <article className="card" key={product.id} data-rv="up" data-rv-delay={index * 110}>
            <div className="card__frame" data-frame data-view={product.view}>
              <span className="card__swatch" style={{ background: product.swatch }} />
              <div className="card__label">
                <b>{product.name}</b>
                <span>{product.material}</span>
              </div>
            </div>
            <div className="card__meta">
              <span>{product.note}</span>
              <span>
                {String(index + 1).padStart(2, "0")} / 03
              </span>
            </div>
            <div className="card__buy">
              <span className="card__price">
                {CURRENCY}
                {product.price}
              </span>
              <button
                type="button"
                className="arrowlink arrowlink--slim"
                onClick={() => onAdd(product.id)}
              >
                <span>Add to bag</span>
                <span className="arrowlink__arrow" aria-hidden="true">
                  <svg viewBox="0 0 14 14" fill="none">
                    <path d="M3 11 11 3M5 3h6v6" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
