import { CURRENCY, PRODUCTS } from "../data/collection";

type BagDrawerProps = {
  bag: Record<string, number>;
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
};

export function BagDrawer({ bag, open, onClose, onRemove }: BagDrawerProps) {
  const lines = PRODUCTS.filter((product) => (bag[product.id] ?? 0) > 0);
  const total = lines.reduce(
    (sum, product) => sum + product.price * (bag[product.id] ?? 0),
    0,
  );
  const count = lines.reduce((sum, product) => sum + (bag[product.id] ?? 0), 0);

  return (
    <>
      <div
        className={`bag__scrim${open ? " is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`bag${open ? " is-open" : ""}`}
        aria-hidden={!open}
        aria-label="Shopping bag"
      >
        <header className="bag__head">
          <h3>Your bag</h3>
          <button type="button" onClick={onClose} aria-label="Close the bag">
            Close
          </button>
        </header>

        {lines.length === 0 ? (
          <p className="bag__empty body">
            Nothing in the bag yet. Every piece is cut to order, so nothing sits
            on a shelf waiting for you.
          </p>
        ) : (
          <ul className="bag__lines">
            {lines.map((product) => (
              <li key={product.id}>
                <span className="bag__swatch" style={{ background: product.swatch }} />
                <span className="bag__text">
                  <b>{product.name}</b>
                  <em>{product.material}</em>
                </span>
                <span className="bag__qty">
                  {bag[product.id]} × {CURRENCY}
                  {product.price}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(product.id)}
                  aria-label={`Remove ${product.name}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <footer className="bag__foot">
          <div>
            <span>Total</span>
            <b>
              {CURRENCY}
              {total}
            </b>
          </div>
          <p className="bag__note">
            {count} piece{count === 1 ? "" : "s"} · Cut to order in Porto ·
            Shipped free over {CURRENCY}200
          </p>
          <button type="button" className="bag__checkout" disabled={lines.length === 0}>
            Checkout
          </button>
        </footer>
      </aside>
    </>
  );
}
