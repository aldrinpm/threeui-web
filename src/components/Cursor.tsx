import { useEffect, useRef } from "react";

/** A single soft dot that trails the pointer. Pointer devices only. */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      dot.classList.add("is-live");
    };

    const onLeave = () => dot.classList.remove("is-live");

    const tick = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="cursor-dot" ref={dotRef} aria-hidden="true" />;
}
