import NavIcon from "./NavIcon";

export type OfferHighlights = {
  activeOffer: string;
  activeOfferUntil: string;
  nextOffer: string;
  nextOfferFrom: string;
};

const offerConfig = {
  activeOffer: {
    label: "Active offer",
    tone: "border-emerald-200/80 bg-[#04c900] text-black shadow-[0_14px_30px_rgba(4,201,0,0.32)]",
    iconPath: "M20 6 9 17l-5-5",
  },
  nextOffer: {
    label: "Next offer",
    tone: "border-white/80 bg-[#ff1616] text-black shadow-[0_14px_30px_rgba(255,22,22,0.32)]",
    iconPath: "M8 5l8 7-8 7",
  },
} as const;

type Props = {
  offers: OfferHighlights;
  compact?: boolean;
  className?: string;
};

type ActiveOfferPhotoBadgeProps = {
  offers: OfferHighlights;
  className?: string;
};

export const readOfferHighlights = (
  fields: Record<string, unknown>
): OfferHighlights => {
  const activeOfferUntil = readFirstText(fields.activeOfferUntil);
  const nextOfferFrom = readFirstText(fields.nextOfferFrom);
  const savedActiveOffer = readFirstText(fields.activeOffer);
  const savedNextOffer = readFirstText(fields.nextOffer);
  const nextOfferIsActive = isDateTodayOrPast(nextOfferFrom);
  const activeOffer = isOfferExpired(activeOfferUntil)
    ? ""
    : nextOfferIsActive && savedNextOffer
      ? savedNextOffer
      : savedActiveOffer;

  return {
    activeOffer,
    activeOfferUntil,
    nextOffer: nextOfferIsActive ? "" : savedNextOffer,
    nextOfferFrom,
  };
};

export const hasOfferHighlights = (offers: OfferHighlights) =>
  Boolean(offers.activeOffer || offers.nextOffer);

export function ProfileActiveOfferPhotoBadge({
  offers,
  className = "",
}: ActiveOfferPhotoBadgeProps) {
  if (!offers.activeOffer) return null;

  const config = offerConfig.activeOffer;

  return (
    <span
      title={config.label}
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-center text-[10px] font-bold uppercase leading-tight tracking-normal ${config.tone} ${className}`}
    >
      {config.label}
    </span>
  );
}

function readFirstText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    const first = value.find(
      (item): item is string => typeof item === "string" && item.trim().length > 0
    );
    return first?.trim() ?? "";
  }
  return "";
}

function isOfferExpired(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  return value < getTodayKey();
}

function isDateTodayOrPast(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return value <= getTodayKey();
}

function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  return `${match[3]}.${match[2]}.${match[1]}`;
}

export default function ProfileOfferBadges({
  offers,
  compact = false,
  className = "",
}: Props) {
  const items = [
    ["activeOffer", offers.activeOffer],
    ["nextOffer", offers.nextOffer],
  ] as const;

  const visibleItems = items.filter(([, value]) => value);
  if (visibleItems.length === 0) return null;

  if (compact) {
    return (
      <div className={`flex w-full flex-wrap items-center justify-end gap-2 ${className}`}>
        {visibleItems.map(([key]) => {
          const config = offerConfig[key];
          return (
            <span
              key={key}
              title={config.label}
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-center text-[10px] font-bold uppercase leading-tight tracking-normal ${config.tone}`}
            >
              {config.label}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      {visibleItems.map(([key, value]) => {
        const config = offerConfig[key];
        return (
          <article
            key={key}
            className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-black/40 p-4 shadow-[0_18px_38px_rgba(0,0,0,0.28)]"
          >
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 text-center text-xs font-bold uppercase leading-tight tracking-normal ${config.tone}`}
            >
              {config.label}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
                <NavIcon path={config.iconPath} />
                {config.label}
                {key === "activeOffer" && offers.activeOfferUntil ? (
                  <span className="tracking-[0.16em] text-[#04c900]">
                    Until {formatDisplayDate(offers.activeOfferUntil)}
                  </span>
                ) : null}
                {key === "nextOffer" && offers.nextOfferFrom ? (
                  <span className="tracking-[0.16em] text-[#ffb3b3]">
                    From {formatDisplayDate(offers.nextOfferFrom)}
                  </span>
                ) : null}
              </p>
              <p className="mt-2 whitespace-pre-wrap break-words text-base leading-relaxed text-white/88">
                {value}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
