import type { ReactNode } from "react";
import Navbar from "./Navbar";

export default function PageShell({
  children,
  widthClassName = "max-w-5xl",
  centered = false,
  contentClassName = "",
}: {
  children: ReactNode;
  widthClassName?: string;
  centered?: boolean;
  contentClassName?: string;
}) {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <Navbar compactDesktop />
      <div
        className={`mx-auto w-full ${widthClassName} px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 ${
          centered ? "flex min-h-[calc(100vh-7rem)] flex-col justify-center" : ""
        } ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}
