"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Footer = dynamic(() => import("./Footer"));

export default function FooterMount() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) {
      return;
    }

    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "320px 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [shouldRender]);

  return (
    <div ref={sentinelRef}>
      {shouldRender ? <Footer /> : <div className="min-h-px" aria-hidden="true" />}
    </div>
  );
}
