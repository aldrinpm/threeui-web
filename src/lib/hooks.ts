import { useEffect } from "react";

/** Adds `rv-in` to every `[data-rv]` block as it scrolls into view. */
export function useReveal(): void {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-rv]"),
    );
    if (elements.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("rv-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          const delay = Number(element.dataset.rvDelay ?? 0);
          window.setTimeout(
            () => element.classList.add("rv-in"),
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : delay,
          );
          observer.unobserve(element);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

/** Reports the chapter whose centre is closest to the middle of the viewport. */
export function useActiveChapter(
  onChange: (id: string) => void,
  selector = "[data-chapter]",
): void {
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>(selector),
      );
      if (sections.length === 0) return;

      const middle = window.innerHeight / 2;
      let current = sections[0].dataset.chapter ?? "hero";
      let best = Number.POSITIVE_INFINITY;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
        const distance = Math.abs(rect.top + rect.height / 2 - middle);
        if (distance < best) {
          best = distance;
          current = section.dataset.chapter ?? current;
        }
      }
      onChange(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [onChange, selector]);
}
