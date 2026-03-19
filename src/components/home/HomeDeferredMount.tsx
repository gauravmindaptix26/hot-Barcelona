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

    const handleFirstScroll = () => {
      setShouldRender(true);
      window.removeEventListener("scroll", handleFirstScroll);
      window.removeEventListener("touchstart", handleFirstScroll);
      window.removeEventListener("wheel", handleFirstScroll);
    };

    window.addEventListener("scroll", handleFirstScroll, { passive: true });
    window.addEventListener("touchstart", handleFirstScroll, { passive: true });
    window.addEventListener("wheel", handleFirstScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleFirstScroll);
      window.removeEventListener("touchstart", handleFirstScroll);
      window.removeEventListener("wheel", handleFirstScroll);
    };
  }, [shouldRender]);

  return shouldRender ? <HomeDeferredSections /> : null;
}
