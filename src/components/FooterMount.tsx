"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { requestTranslationRefresh } from "@/lib/language";

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

    const timeoutId = window.setTimeout(() => {
      setShouldRender(true);
    }, 12000);

    if (typeof IntersectionObserver === "undefined") {
      return () => window.clearTimeout(timeoutId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          window.clearTimeout(timeoutId);
          observer.disconnect();
        }
      },
      {
        rootMargin: "320px 0px",
      }
    );

    observer.observe(node);

    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    requestTranslationRefresh();
  }, [shouldRender]);

  return (
    <div ref={sentinelRef}>
      {shouldRender ? <Footer /> : <div className="min-h-px" aria-hidden="true" />}
    </div>
  );
}
