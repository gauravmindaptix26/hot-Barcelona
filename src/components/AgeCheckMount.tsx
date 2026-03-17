"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const AgeCheckModal = dynamic(() => import("./AgeCheckModal"), {
  ssr: false,
});

const AGE_CHECK_KEY = "hb_age_verified_session_v2";

export default function AgeCheckMount() {
  const [shouldRender] = useState(() => {
    try {
      return window.sessionStorage.getItem(AGE_CHECK_KEY) !== "true";
    } catch {
      return true;
    }
  });

  return shouldRender ? <AgeCheckModal /> : null;
}
