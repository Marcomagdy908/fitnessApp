import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Reusable hook to animate children elements matching the selector
 * with a staggered fade-in, slide-up, and scale-up entrance animation.
 * 
 * @param selector CSS selector for elements to animate (e.g. '.card')
 * @param dependencies Dependencies array to trigger/re-run the animation (e.g. [loading])
 */
export function usePageFadeIn<T extends HTMLElement = HTMLDivElement>(
  selector = ".gsap-fade",
  dependencies: any[] = []
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      const ctx = gsap.context(() => {
        // Query elements matching selector to ensure they exist before animating
        const targets = ref.current?.querySelectorAll(selector);
        if (targets && targets.length > 0) {
          gsap.fromTo(
            targets,
            {
              opacity: 0,
              y: 25,
              scale: 0.98,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.55,
              stagger: 0.04,
              ease: "power2.out",
              clearProps: "all",
            }
          );
        }
      }, ref);
      return () => ctx.revert();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return ref;
}
