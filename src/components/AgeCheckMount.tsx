"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const AgeCheckModal = dynamic(() => import("./AgeCheckModal"), {
  ssr: false,
});

const AGE_CHECK_KEY = "hb_age_verified_session_v2";

export default function AgeCheckMount() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        setShouldRender(window.sessionStorage.getItem(AGE_CHECK_KEY) !== "true");
      } catch {
        setShouldRender(true);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return shouldRender ? <AgeCheckModal /> : null;
}
