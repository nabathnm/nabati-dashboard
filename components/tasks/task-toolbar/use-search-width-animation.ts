"use client";

import type { RefObject } from "react";
import { useCallback, useLayoutEffect, useRef } from "react";
import type { TaskView } from "./task-toolbar";

interface UseSearchWidthAnimationReturn {
  searchRef: RefObject<HTMLDivElement | null>;
  prepareAnimation: () => void;
}

export function useSearchWidthAnimation(view: TaskView): UseSearchWidthAnimationReturn {
  const searchRef = useRef<HTMLDivElement>(null);
  const widthBeforeToggle = useRef<number | null>(null);
  const animationRef = useRef<Animation | null>(null);

  const prepareAnimation = useCallback(() => {
    widthBeforeToggle.current = searchRef.current?.getBoundingClientRect().width ?? null;
  }, []);

  useLayoutEffect(() => {
    const element = searchRef.current;
    const from = widthBeforeToggle.current;

    widthBeforeToggle.current = null;

    if (!element || from === null) return;

    const to = element.getBoundingClientRect().width;

    if (Math.abs(to - from) < 0.5) return;

    animationRef.current?.cancel();

    element.style.flexShrink = "0";
    element.style.flexGrow = "0";

    const animation = element.animate([{ width: `${from}px` }, { width: `${to}px` }], {
      duration: 300,
      easing: "ease-in-out",
    });

    animationRef.current = animation;

    const release = () => {
      element.style.flexShrink = "";
      element.style.flexGrow = "";

      if (animationRef.current === animation) {
        animationRef.current = null;
      }
    };

    animation.onfinish = release;
    animation.oncancel = release;

    return () => {
      animation.cancel();
    };
  }, [view]);

  return { searchRef, prepareAnimation };
}
