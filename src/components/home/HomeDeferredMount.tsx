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

    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    let idleId: number | null = null;

    const loadDeferredSections = () => setShouldRender(true);

    if ("requestIdleCallback" in globalThis) {
      idleId = globalThis.requestIdleCallback(loadDeferredSections, { timeout: 1500 });
    } else {
      timeoutId = globalThis.setTimeout(loadDeferredSections, 700);
    }

    return () => {
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
      if (idleId !== null && "cancelIdleCallback" in globalThis) {
        globalThis.cancelIdleCallback(idleId);
      }
    };
  }, [shouldRender]);

  return shouldRender ? <HomeDeferredSections /> : null;
}
