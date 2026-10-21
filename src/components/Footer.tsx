import { PRODUCTS } from "../data/collection";

export function Footer() {
  return (
    <footer className="foot" id="footer" data-chapter="footer">
      <div className="foot__grid">
        <div className="foot__brand">
          <svg viewBox="0 0 44 44" fill="none" width="34" height="34" aria-hidden="true">
            <path d="M22 5v34M9 10h26M9 10 4 18h10zM35 10l5 8H30z" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="22" cy="31" r="3.6" fill="currentColor" />
          </svg>
          <p>
            SERA is an atelier of six people in Porto. We cut, sew, repair, and
            re-cut. Nothing leaves the studio that we would not wear ourselves.
          </p>
        </div>

        <div>
          <h4>Collection</h4>
          <ul>
            {PRODUCTS.map((product) => (
              <li key={product.id}>
                <a href="#collection">{product.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Service</h4>
          <ul>
            <li><a href="#fitting">Alterations</a></li>
            <li><a href="#fitting">Repairs</a></li>
            <li><a href="#fitting">Shipping</a></li>
            <li><a href="#fitting">Returns</a></li>
          </ul>
        </div>

        <div>
          <h4>Elsewhere</h4>
          <ul>
            <li><a href="#cutting">Journal</a></li>
            <li><a href="#cutting">Stockists</a></li>
            <li><a href="#cutting">Careers</a></li>
          </ul>
        </div>
      </div>

      <div className="foot__base">
        <span>© 2026 SERA — Atelier of slow cloth</span>
        <span className="foot__motto">Made to be worn out</span>
        <span>WebGL · Onest · Porto</span>
      </div>
    </footer>
  );
}
