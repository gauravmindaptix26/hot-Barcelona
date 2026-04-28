"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const HomeDeferredSections = dynamic(() => import("./HomeDeferredSections"));

export default function HomeDeferredMount() {
  const [shouldRender, setShouldRender] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldRender) {
      return;
    }

    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;

    const loadDeferredSections = () => setShouldRender(true);

    let observer: IntersectionObserver | null = null;

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            loadDeferredSections();
          }
        },
        { rootMargin: "320px 0px" }
      );

      if (sentinelRef.current) {
        observer.observe(sentinelRef.current);
      }
    }

    timeoutId = globalThis.setTimeout(loadDeferredSections, 4000);

    return () => {
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
      if (observer) {
        observer.disconnect();
      }
    };
  }, [shouldRender]);

  return shouldRender ? (
    <HomeDeferredSections />
  ) : (
    <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
  );
}
