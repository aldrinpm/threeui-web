import { useCallback, useEffect, useRef, useState } from "react";
import { AtelierScene } from "./scene/atelierScene";
import { useActiveChapter, useReveal } from "./lib/hooks";
import { PRODUCTS, type ChapterId } from "./data/collection";
import { Preloader } from "./components/Preloader";
import { Cursor } from "./components/Cursor";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { ChapterCutting } from "./components/ChapterCutting";
import { ChapterRail } from "./components/ChapterRail";
import { LoomBand } from "./components/LoomBand";
import { ChapterCollection } from "./components/ChapterCollection";
import { ChapterFitting } from "./components/ChapterFitting";
import { Footer } from "./components/Footer";
import { BagDrawer } from "./components/BagDrawer";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<AtelierScene | null>(null);
  const toastTimer = useRef(0);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState("hero");
  const [bag, setBag] = useState<Record<string, number>>({});
  const [bagOpen, setBagOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useReveal();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new AtelierScene({
      canvas,
      onProgress: setProgress,
      onReady: () => setReady(true),
    });
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  const handleChapter = useCallback((id: string) => {
    setChapter(id);
    sceneRef.current?.setChapter(id as ChapterId);
  }, []);

  useActiveChapter(handleChapter);

  const addToBag = useCallback((id: string) => {
    setBag((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    const product = PRODUCTS.find((item) => item.id === id);
    setToast(`${product?.name ?? "Piece"} added to the bag`);
  }, []);

  const removeFromBag = useCallback((id: string) => {
    setBag((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  useEffect(() => {
    if (!toast) return;
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(toastTimer.current);
  }, [toast]);

  const bagCount = Object.values(bag).reduce((sum, value) => sum + value, 0);

  return (
    <>
      <canvas id="gl" ref={canvasRef} aria-hidden="true" />
      <div id="vignette" aria-hidden="true" />
      <div id="grain" aria-hidden="true" />
      <Cursor />

      <Preloader progress={progress} done={ready} />

      <Nav bagCount={bagCount} onOpenBag={() => setBagOpen(true)} />

      <div className="page" id="top">
        <Hero activeChapter={chapter} />
        <ChapterCutting />
        <ChapterRail onAdd={addToBag} />
        <LoomBand />
        <ChapterCollection onAdd={addToBag} />
        <ChapterFitting />
        <Footer />
      </div>

      <BagDrawer
        bag={bag}
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        onRemove={removeFromBag}
      />

      <div className={`toast${toast ? " is-live" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}
