import { useState, type CSSProperties } from "react";
import { CURRENCY, PRODUCTS } from "../data/collection";

type ChapterCollectionProps = {
  onAdd: (id: string) => void;
};

export function ChapterCollection({ onAdd }: ChapterCollectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="sec" id="collection" data-chapter="collection">
      <div className="sec__head" data-rv="fade">
        <span className="sec__kicker">
          <b>03</b> — The Collection
        </span>
        <span className="sec__rule" />
        <span className="sec__kicker">Five pieces</span>
      </div>

      <div className="collection__head">
        <h2 className="display display--sec" data-rv="up">
          Five pieces. One fit. Ten years of wear.
        </h2>
        <p className="body-lg" data-rv="up">
          The studio makes five garments a week and restocks them in three
          colours. Sizes run XS to XXL, and the fit is the same across the
          collection — so the coat you love in wool works in cotton too.
        </p>
      </div>

      <div className="pieces">
        {PRODUCTS.map((product, index) => {
          const open = openId === product.id;
          return (
            <div className={`piece${open ? " is-open" : ""}`} key={product.id} data-rv="up" data-rv-delay={index * 70}>
              <button
                type="button"
                className="piece__row"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : product.id)}
              >
                <span className="piece__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="piece__name">
                  <b>{product.name}</b>
                  <em>{product.material}</em>
                </span>
                <span className="piece__note">{product.note}</span>
                <span className="piece__price">
                  {CURRENCY}
                  {product.price}
                </span>
                <i className="piece__bar" style={{ "--level": `${Math.round(product.stock * 100)}%` } as CSSProperties} />
              </button>

              <div className="piece__detail" hidden={!open}>
                <p className="body">{product.detail}</p>
                <div className="piece__actions">
                  <span className="piece__sizes">
                    {product.sizes.map((size) => (
                      <i key={size}>{size}</i>
                    ))}
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
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
