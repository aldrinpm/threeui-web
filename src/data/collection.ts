export type ChapterId =
  | "hero"
  | "cutting"
  | "rail"
  | "collection"
  | "fitting"
  | "footer";

export type Product = {
  id: string;
  name: string;
  material: string;
  price: number;
  note: string;
  detail: string;
  /** Index of the live 3D viewport used by the product card. */
  view: number;
  /** Remaining stock as a fraction, drives the level bar. */
  stock: number;
  sizes: string[];
  swatch: string;
};

export const CURRENCY = "$";

export const PRODUCTS: Product[] = [
  {
    id: "trench",
    name: "The Atelier Trench",
    material: "Waxed cotton gabardine",
    price: 480,
    note: "Double-breasted, storm-cuffed, and quiet enough for a Tuesday.",
    detail:
      "Cut from a single length of waxed cotton, so no two trenchcoats match exactly. The storm cuff is stitched inside the sleeve, the belt is raw-edged, and the whole thing weighs less than a laptop.",
    view: 0,
    stock: 0.62,
    sizes: ["XS", "S", "M", "L", "XL"],
    swatch: "#5e2823",
  },
  {
    id: "overcoat",
    name: "The Wool Overcoat",
    material: "Double-faced lambswool",
    price: 690,
    note: "One seam, no lining, and a cut that keeps its line for a decade.",
    detail:
      "Double-faced cloth means there is nothing to hide behind: no lining, no shoulder pad, one seam from collar to hem. It takes two coats' worth of yarn to make one, which is why it is priced the way it is.",
    view: 1,
    stock: 0.28,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    swatch: "#3d3934",
  },
  {
    id: "crew",
    name: "The Merino Crew",
    material: "Fine merino, twelve gauge",
    price: 165,
    note: "Knitted in a family mill in Scotland that has been at it since 1890.",
    detail:
      "Twelve gauge means a dense, flat knit that holds its shape at the cuff and the waistband. Fully fashioned, so the seams are knitted to fit rather than cut and sewn afterwards.",
    view: 2,
    stock: 0.84,
    sizes: ["XS", "S", "M", "L", "XL"],
    swatch: "#a8967a",
  },
  {
    id: "overshirt",
    name: "The Linen Overshirt",
    material: "Belgian flax linen",
    price: 210,
    note: "Washed twice before it reaches you, so it arrives already soft.",
    detail:
      "Flax from a grower outside Kortrijk, spun in a mill that still runs its own softening line. The shirt creases the way linen should, and it is the piece most people buy twice.",
    view: 0,
    stock: 0.46,
    sizes: ["S", "M", "L", "XL"],
    swatch: "#cfc4b0",
  },
  {
    id: "trouser",
    name: "The Selvedge Trouser",
    material: "Japanese selvedge denim",
    price: 220,
    note: "A straight leg that slowly softens into your own shape.",
    detail:
      "Chain-stitched hem, hidden rivets, and a rise cut to sit at the natural waist. The denim is unsanforised, so it fades along the thigh and the pocket edge the way it should.",
    view: 2,
    stock: 0.71,
    sizes: ["28", "30", "32", "34", "36", "38"],
    swatch: "#27304a",
  },
];

/** The three pieces shown as live 3D cards in the rail chapter. */
export const CARD_PRODUCTS = [PRODUCTS[0], PRODUCTS[1], PRODUCTS[4]];

export const CHAPTER_LINKS: {
  id: ChapterId;
  label: string;
  alt: string;
  title: string;
  blurb: string;
  target: string;
}[] = [
  {
    id: "cutting",
    label: "Cutting",
    alt: "Mills",
    title: "The Cutting",
    blurb: "Long-fibre wool, Belgian linen, and Japanese denim, chosen for how they age.",
    target: "#cutting",
  },
  {
    id: "rail",
    label: "The Rail",
    alt: "Hangers",
    title: "The Rail",
    blurb: "Seven pieces in the studio, each one a silhouette you can live in.",
    target: "#rail",
  },
  {
    id: "collection",
    label: "Collection",
    alt: "Pieces",
    title: "The Collection",
    blurb: "Five garments, one fit, and the numbers that decide when they are ready.",
    target: "#collection",
  },
  {
    id: "fitting",
    label: "Fitting",
    alt: "Try-on",
    title: "The Fitting",
    blurb: "Try it, wear it, send it back. We adjust every seam by hand.",
    target: "#fitting",
  },
];

export const STATS: { value: string; label: string }[] = [
  { value: "12", label: "Mills we buy from" },
  { value: "60", label: "Metres per roll" },
  { value: "03", label: "Days per coat" },
  { value: "∞", label: "Rewears" },
];
