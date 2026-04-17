"use client";

import { useEffect, useState } from "react";

type ToggleState = "yes" | "no";

const inputClassName =
  "w-full rounded-[22px] border border-white/10 bg-black/50 px-4 py-3.5 text-base text-white/88 placeholder:text-white/35 focus:border-[#f5d68c]/60 focus:outline-none disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-black/25 disabled:text-white/35";

const toggleButtonClassName =
  "rounded-[16px] px-4 py-3 text-sm uppercase tracking-[0.24em] transition";

const readTextValue = (formFields: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const raw = formFields[key];
    if (typeof raw === "string" && raw.trim()) {
      return raw.trim();
    }
    if (Array.isArray(raw)) {
      const first = raw.find(
        (item): item is string => typeof item === "string" && item.trim().length > 0
      );
      if (first) {
        return first.trim();
      }
    }
  }

  return "";
};

const parseToggleState = (value: string): ToggleState | null => {
  const normalized = value.trim().toLowerCase();
  if (["yes", "true", "1", "on"].includes(normalized)) return "yes";
  if (["no", "false", "0", "off"].includes(normalized)) return "no";
  return null;
};

const readToggleValue = (
  formFields: Record<string, unknown>,
  keys: string[],
  fallback: ToggleState
) => {
  const raw = readTextValue(formFields, keys);
  const parsed = raw ? parseToggleState(raw) : null;
  return parsed ?? fallback;
};

function ContactToggleCard({
  title,
  description,
  enabled,
  onEnabledChange,
  toggleName,
  inputName,
  inputValue,
  onInputChange,
  placeholder,
  helperText,
}: {
  title: string;
  description: string;
  enabled: ToggleState;
  onEnabledChange: (value: ToggleState) => void;
  toggleName: string;
  inputName: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  placeholder: string;
  helperText: string;
}) {
  const isEnabled = enabled === "yes";

  return (
    <div
      className={`rounded-[28px] border p-5 shadow-[0_24px_50px_rgba(0,0,0,0.24)] transition sm:p-6 ${
        isEnabled
          ? "border-[#f5d68c]/35 bg-[linear-gradient(155deg,rgba(245,214,140,0.13),rgba(245,179,92,0.05)_32%,rgba(0,0,0,0.45)_78%)]"
          : "border-white/10 bg-black/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-semibold text-white sm:text-xl">{title}</p>
          <p className="mt-2 text-base leading-relaxed text-white/58">{description}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] ${
            isEnabled
              ? "border-[#f5d68c]/35 bg-[#f5d68c]/10 text-[#f5d68c]"
              : "border-white/10 bg-black/45 text-white/45"
          }`}
        >
          {isEnabled ? "Enabled" : "Hidden"}
        </span>
      </div>

      <div className="mt-5 rounded-[22px] border border-white/10 bg-black/45 p-2.5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onEnabledChange("no")}
            className={`${toggleButtonClassName} ${
              !isEnabled
                ? "bg-white/12 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            No
          </button>
          <button
            type="button"
            onClick={() => onEnabledChange("yes")}
            className={`${toggleButtonClassName} ${
              isEnabled
                ? "bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] text-black"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            Yes
          </button>
        </div>
      </div>

      <input type="hidden" name={toggleName} value={enabled} />

      <div className="mt-5 space-y-2.5">
        <input
          name={inputName}
          value={inputValue}
          disabled={!isEnabled}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder={placeholder}
          className={inputClassName}
        />
        <p className="text-sm leading-relaxed text-white/45">{helperText}</p>
      </div>
    </div>
  );
}

export default function ContactPreferences() {
  const [whatsappEnabled, setWhatsappEnabled] = useState<ToggleState>("no");
  const [telegramEnabled, setTelegramEnabled] = useState<ToggleState>("no");
  const [whatsappValue, setWhatsappValue] = useState("");
  const [telegramValue, setTelegramValue] = useState("");

  useEffect(() => {
    const handlePrefill = (event: Event) => {
      const profile =
        (event as CustomEvent<{ profile?: { formFields?: Record<string, unknown> } }>).detail?.profile;
      const formFields =
        profile?.formFields && typeof profile.formFields === "object" && !Array.isArray(profile.formFields)
          ? profile.formFields
          : {};

      const nextWhatsappValue = readTextValue(formFields, ["whatsapp", "whatsappNumber"]);
      const nextTelegramValue = readTextValue(formFields, [
        "telegramUsername",
        "telegram",
        "telegramLink",
      ]);

      setWhatsappEnabled(
        readToggleValue(
          formFields,
          ["whatsappEnabled", "whatsappToggle", "attendsByWhatsApp"],
          nextWhatsappValue ? "yes" : "no"
        )
      );
      setTelegramEnabled(
        readToggleValue(
          formFields,
          ["telegramEnabled", "telegramToggle", "attendsByTelegram"],
          nextTelegramValue ? "yes" : "no"
        )
      );
      setWhatsappValue(nextWhatsappValue);
      setTelegramValue(nextTelegramValue.replace(/^@+/, ""));
    };

    window.addEventListener("profile:prefill", handlePrefill as EventListener);
    return () => window.removeEventListener("profile:prefill", handlePrefill as EventListener);
  }, []);

  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(10,11,13,0.92)_42%)] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.3)] sm:p-7">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#f5d68c] sm:text-xs sm:tracking-[0.34em]">
          Contact Channels
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-white sm:text-[2rem]">
          Messaging contact options
        </h3>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/62 sm:text-lg">
          Choose which contact methods you want to show.
        </p>
      </div>

      <div className="mt-6 grid gap-5 2xl:grid-cols-2">
        <ContactToggleCard
          title="Attend by WhatsApp"
          description="Show a WhatsApp contact button on your profile."
          enabled={whatsappEnabled}
          onEnabledChange={setWhatsappEnabled}
          toggleName="whatsappEnabled"
          inputName="whatsapp"
          inputValue={whatsappValue}
          onInputChange={setWhatsappValue}
          placeholder="WhatsApp number for profile button"
          helperText=""
        />
        <ContactToggleCard
          title="Attend by Telegram"
          description="Show a Telegram contact option using your username."
          enabled={telegramEnabled}
          onEnabledChange={setTelegramEnabled}
          toggleName="telegramEnabled"
          inputName="telegramUsername"
          inputValue={telegramValue}
          onInputChange={(value) => setTelegramValue(value.replace(/^@+/, ""))}
          placeholder="Telegram username (without @)"
          helperText=""
        />
      </div>
    </div>
  );
}
