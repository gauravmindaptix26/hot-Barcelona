"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HomeDeferredSections = dynamic(() => import("./HomeDeferredSections"));

export default function HomeDeferredMount() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) {
      return;
    }

    let timeoutId: ReturnType<typeof window.setTimeout> | null = null;
    let idleId: number | null = null;

    const loadDeferredSections = () => setShouldRender(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(loadDeferredSections, { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(loadDeferredSections, 700);
    }

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [shouldRender]);

  return shouldRender ? <HomeDeferredSections /> : null;
}
