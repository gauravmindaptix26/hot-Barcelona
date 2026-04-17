"use client";

import { useEffect, useState, type RefObject } from "react";
import NavIcon from "./NavIcon";

export type ProfileSidebarSection = {
  id: string;
  label: string;
  iconPath: string;
  disabled?: boolean;
};

type ProfileSectionSidebarProps = {
  sections: ProfileSidebarSection[];
  scrollContainerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
};

const scrollOffset = 24;

const closeIconPath = "M6 6l12 12M18 6l-12 12";

export default function ProfileSectionSidebar({
  sections,
  scrollContainerRef,
  onClose,
}: ProfileSectionSidebarProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const enabledSections = sections.filter((section) => !section.disabled);

    if (!container || enabledSections.length === 0) return;

    const syncActiveSection = () => {
      const containerTop = container.getBoundingClientRect().top;
      const threshold = containerTop + scrollOffset + 40;
      let currentSection = enabledSections[0]?.id ?? null;

      for (const section of enabledSections) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= threshold) {
          currentSection = section.id;
        }
      }

      setActiveSection(currentSection);
    };

    syncActiveSection();
    container.addEventListener("scroll", syncActiveSection, { passive: true });

    return () => {
      container.removeEventListener("scroll", syncActiveSection);
    };
  }, [scrollContainerRef, sections]);

  const scrollToSection = (sectionId: string) => {
    const container = scrollContainerRef.current;
    const target = document.getElementById(sectionId);
    if (!container || !target) return;

    const nextTop =
      target.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      scrollOffset;

    container.scrollTo({
      top: Math.max(0, nextTop),
      behavior: "smooth",
    });
    setActiveSection(sectionId);
  };

  return (
    <aside className="sticky top-4 w-[74px] self-start sm:top-5 sm:w-[82px] md:top-6 md:w-[92px] lg:w-[98px]">
      <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(32,32,32,0.96),rgba(18,18,18,0.94))] px-1.5 py-3 shadow-[0_24px_48px_rgba(0,0,0,0.35)] sm:rounded-[28px] sm:px-2 sm:py-4">
        <div className="flex flex-col items-center gap-1">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.label}
                type="button"
                disabled={section.disabled}
                onClick={() => scrollToSection(section.id)}
                aria-pressed={isActive}
                className={`flex w-full flex-col items-center gap-1 rounded-[18px] px-1.5 py-2.5 text-center transition sm:rounded-[20px] sm:px-2 sm:py-3 ${
                  section.disabled
                    ? "cursor-not-allowed opacity-35"
                    : isActive
                      ? "bg-black/35 text-white"
                      : "text-white/78 hover:bg-black/25 hover:text-white"
                }`}
              >
                <NavIcon
                  path={section.iconPath}
                  className="h-6 w-6 text-[#ff2a1a] sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                />
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.18em]">
                  {section.label}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onClose}
            className="mt-1 flex w-full flex-col items-center gap-1 rounded-[18px] px-1.5 py-2.5 text-center text-white/78 transition hover:bg-black/25 hover:text-white sm:rounded-[20px] sm:px-2 sm:py-3"
          >
            <NavIcon
              path={closeIconPath}
              className="h-6 w-6 text-[#ff2a1a] sm:h-7 sm:w-7 lg:h-8 lg:w-8"
            />
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.18em]">
              Cerrar
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
