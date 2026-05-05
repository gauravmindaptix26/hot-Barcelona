"use client";

import { useEffect } from "react";

let activeLocks = 0;
let previousOverflow = "";
let previousPaddingRight = "";

const getScrollbarWidth = () =>
  Math.max(0, window.innerWidth - document.documentElement.clientWidth);

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) {
      return;
    }

    activeLocks += 1;

    if (activeLocks === 1) {
      previousOverflow = document.body.style.overflow;
      previousPaddingRight = document.body.style.paddingRight;

      const scrollbarWidth = getScrollbarWidth();
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);

      if (activeLocks === 0) {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
      }
    };
  }, [locked]);
}
