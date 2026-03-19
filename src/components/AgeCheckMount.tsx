"use client";

import dynamic from "next/dynamic";

const AgeCheckModal = dynamic(() => import("./AgeCheckModal"), {
  ssr: false,
});

export default function AgeCheckMount() {
  return <AgeCheckModal />;
}
