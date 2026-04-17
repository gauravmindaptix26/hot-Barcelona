"use client";

import type { ReactNode } from "react";
import NavIcon from "./NavIcon";

type ActionTileProps = {
  label: string;
  hint: string;
  path?: string;
  icon?: ReactNode;
  href?: string | null;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  accentClassName?: string;
  iconShellClassName?: string;
};

type Props = {
  isAuthenticated: boolean;
  phoneHref?: string | null;
  phoneLabel?: string | null;
  whatsappHref?: string | null;
  telegramHref?: string | null;
  telegramLabel?: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  shareFeedback?: string | null;
};

function ActionTile({
  label,
  hint,
  path,
  icon,
  href,
  onClick,
  disabled = false,
  active = false,
  accentClassName = "",
  iconShellClassName = "",
}: ActionTileProps) {
  const className = [
    "flex min-h-[86px] w-full flex-col items-center justify-center gap-2 rounded-[22px] border px-3 py-3 text-center transition sm:min-h-[92px] sm:px-4 sm:py-3.5",
    disabled
      ? "cursor-not-allowed border-white/8 bg-black/15 text-white/45"
      : active
        ? "border-[#f5d68c]/45 bg-[linear-gradient(145deg,rgba(245,214,140,0.18),rgba(11,12,16,0.88)_65%)] text-white shadow-[0_12px_26px_rgba(245,179,92,0.14)]"
        : "border-white/10 bg-black/18 text-white/80 hover:border-[#f5d68c]/35 hover:bg-black/24 hover:text-white",
    accentClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full border text-inherit ${
          disabled
            ? "border-white/8 bg-black/10"
            : active
              ? "border-[#f5d68c]/35 bg-[#f5d68c]/10 shadow-[0_8px_18px_rgba(245,179,92,0.16)]"
              : "border-white/10 bg-black/12"
        } ${iconShellClassName}`}
      >
        {icon ?? (path ? <NavIcon path={path} className="h-5 w-5" /> : null)}
      </span>
      <div>
        <p className="text-[13px] font-semibold tracking-[0.06em] text-white sm:text-[14px]">{label}</p>
        <p className="mt-0.5 text-[11px] leading-tight text-white/58 sm:text-xs">{hint}</p>
      </div>
    </>
  );

  if (href && !disabled) {
    const openInNewTab = !href.startsWith("tel:");
    return (
      <a
        href={href}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noreferrer" : undefined}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {content}
    </button>
  );
}

function PhoneBrandIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 sm:h-9 sm:w-9">
      <path
        fill="#ffffff"
        d="M12.7 6.4c.6-.7 1.3-1 2.2-1h1.9c.8 0 1.5.5 1.7 1.3l.9 3.7c.1.6 0 1.1-.4 1.5l-1.7 1.7c1.5 2.5 3.5 4.5 6 6l1.7-1.7c.4-.4 1-.6 1.5-.4l3.7.9c.8.2 1.3.9 1.3 1.7v1.9c0 .9-.3 1.7-1 2.2-1.4 1.2-3.2 1.7-5 1.4C14.9 26 6 17.1 4.1 8.9c-.3-1.8.2-3.6 1.4-5Z"
      />
      <path
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.4"
        strokeLinecap="round"
        d="M21.8 7.8a8.8 8.8 0 0 1 3.4 3.4M20.8 11a5.2 5.2 0 0 1 2.2 2.2"
      />
    </svg>
  );
}

function WhatsAppBrandIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 sm:h-9 sm:w-9">
      <path
        fill="#25D366"
        d="M16 5c-6.07 0-11 4.8-11 10.72 0 2.37.8 4.56 2.14 6.33L5.7 27l5.18-1.35A11.35 11.35 0 0 0 16 26.43c6.07 0 11-4.8 11-10.71C27 9.8 22.07 5 16 5Z"
      />
      <path
        fill="#ffffff"
        d="M16.02 8.02c-4.22 0-7.64 3.29-7.64 7.35 0 1.63.55 3.13 1.49 4.34l-.62 2.32 2.39-.62a7.8 7.8 0 0 0 4.38 1.33c4.22 0 7.64-3.29 7.64-7.37 0-4.06-3.42-7.35-7.64-7.35Zm4.48 9.62c-.22.63-1.2 1.16-1.68 1.23-.44.06-.99.1-1.62-.1-.38-.13-.88-.27-1.53-.56-2.67-1.14-4.42-3.95-4.56-4.13-.14-.18-1.08-1.47-1.08-2.8 0-1.32.7-1.96.94-2.23.24-.27.52-.33.72-.33h.52c.17 0 .38 0 .57.44.22.5.74 1.75.8 1.9.07.14.11.29.03.47-.08.18-.15.29-.28.46-.13.15-.28.34-.41.45-.13.14-.25.27-.1.56.15.28.68 1.13 1.47 1.81.99.87 1.84 1.13 2.12 1.26.28.13.45.11.6-.08.17-.18.69-.8.87-1.08.19-.27.36-.22.62-.14.25.1 1.57.75 1.84.88.27.13.45.2.52.29.07.1.07.63-.17 1.28Z"
      />
    </svg>
  );
}

function TelegramBrandIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 sm:h-9 sm:w-9">
      <circle cx="16" cy="16" r="11" fill="#229ED9" />
      <path
        fill="#ffffff"
        d="m23.47 10.02-2.06 9.76c-.15.68-.57.87-1.16.53l-3.19-2.35-1.54 1.48c-.17.17-.31.31-.65.31l.23-3.28 5.96-5.38c.26-.23-.06-.36-.4-.12l-7.37 4.64-3.18-1c-.68-.22-.7-.69.14-1l12.34-4.76c.57-.22 1.07.13.88 1.17Z"
      />
    </svg>
  );
}

function HeartFilledIcon({ disabled = false, active = false }: { disabled?: boolean; active?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 sm:h-9 sm:w-9">
      <path
        fill={disabled ? "#6b7280" : active ? "#f5d68c" : "#ffffff"}
        d="M16 27.2s-9.48-5.86-12.24-11.06c-2.1-3.96-.3-8.84 4.78-8.84 3.07 0 5.11 1.72 6.33 3.62 1.22-1.9 3.26-3.62 6.33-3.62 5.08 0 6.88 4.88 4.78 8.84C25.48 21.34 16 27.2 16 27.2Z"
      />
    </svg>
  );
}

function ShareFilledIcon({ disabled = false }: { disabled?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 sm:h-9 sm:w-9">
      <path
        fill={disabled ? "#6b7280" : "#ffffff"}
        d="M23.5 8.75a3.75 3.75 0 1 0-3.43-5.24 3.76 3.76 0 0 0 .5 3.98l-7.21 4.2a3.75 3.75 0 1 0 0 8.63l7.21 4.2a3.75 3.75 0 1 0 .85-1.46l-7.2-4.2a3.82 3.82 0 0 0 0-5.72l7.2-4.2c.57.47 1.3.81 2.08.81Z"
      />
    </svg>
  );
}

export default function ProfileActionBar({
  isAuthenticated,
  phoneHref = null,
  phoneLabel = null,
  whatsappHref = null,
  telegramHref = null,
  telegramLabel = null,
  isFavorite,
  onToggleFavorite,
  onShare,
  shareFeedback = null,
}: Props) {
  const hasDirectContact = Boolean(phoneHref || whatsappHref || telegramHref);
  const lockedHint =
    !isAuthenticated && !hasDirectContact
      ? "Inicia sesion para guardar favoritos y desbloquear mas acciones."
      : null;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(155deg,rgba(255,255,255,0.05),rgba(10,11,13,0.98)_42%)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs sm:tracking-[0.45em]">
            Quick Actions
          </p>
          <p className="mt-2 text-sm text-white/60">
            Open the saved contact actions or share this profile instantly.
          </p>
        </div>
        {shareFeedback && (
          <span className="rounded-full border border-[#f5d68c]/30 bg-[#f5d68c]/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f5d68c]">
            {shareFeedback}
          </span>
        )}
      </div>

      {lockedHint && <p className="mt-3 text-sm text-white/50">{lockedHint}</p>}

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 lg:gap-3">
        <ActionTile
          label="llamar"
          hint={phoneLabel ?? (isAuthenticated ? "Tocar para llamar" : "Se requiere iniciar sesión")}
          icon={<PhoneBrandIcon />}
          href={phoneHref}
          disabled={!phoneHref}
          accentClassName={!phoneHref ? "" : "text-white"}
          iconShellClassName="border-[#22c55e]/15 bg-[#22c55e]/10"
        />
        <ActionTile
          label="enviar whats"
          hint={whatsappHref ? "Abrir WhatsApp" : isAuthenticated ? "WhatsApp no guardado" : "Se requiere iniciar sesión"}
          icon={<WhatsAppBrandIcon />}
          href={whatsappHref}
          disabled={!whatsappHref}
          accentClassName={!whatsappHref ? "" : "text-white"}
          iconShellClassName="border-[#25D366]/15 bg-[#25D366]/10"
        />
        <ActionTile
          label="telegram"
          hint={telegramLabel ?? (isAuthenticated ? "Abrir Telegram" : "Se requiere iniciar sesión")}
          icon={<TelegramBrandIcon />}
          href={telegramHref}
          disabled={!telegramHref}
          accentClassName={!telegramHref ? "" : "text-white"}
          iconShellClassName="border-[#229ED9]/15 bg-[#229ED9]/10"
        />
        <ActionTile
          label="favoritos"
          hint={isFavorite ? "Guardado en favoritos" : "Guardar este perfil"}
          icon={<HeartFilledIcon active={isFavorite} />}
          onClick={onToggleFavorite}
          active={isFavorite}
          accentClassName="text-white"
        />
        <ActionTile
          label="compartir"
          hint={shareFeedback ?? "Copiar enlace del perfil"}
          icon={<ShareFilledIcon />}
          onClick={onShare}
          accentClassName="text-white"
        />
      </div>
    </section>
  );
}
