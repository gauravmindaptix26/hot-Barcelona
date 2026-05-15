"use client";

import { useCallback, useEffect, useState } from "react";

type LoadedProfile = {
  gender: "girl" | "trans";
  name: string;
  age: number | null;
  location: string;
  images: string[];
  imageApprovals?: Record<string, string>;
  email: string;
  formFields?: Record<string, unknown>;
};

type Props = {
  initialProfile?: LoadedProfile | null;
};

export default function ProfileLoader({ initialProfile = null }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(Boolean(initialProfile));
  const [showPassword, setShowPassword] = useState(false);

  const fillForm = useCallback((profile: LoadedProfile) => {
    const form = document.getElementById(
      "registro-escorts-form"
    ) as HTMLFormElement | null;
    if (!form) return;

    const setValue = (name: string, value: string) => {
      const radio = form.querySelector(
        `input[name="${CSS.escape(name)}"][value="${CSS.escape(value)}"]`
      ) as HTMLInputElement | null;
      if (radio && radio.type === "radio") {
        radio.checked = true;
        radio.dispatchEvent(new Event("input", { bubbles: true }));
        radio.dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }

      const el = form.querySelector(
        `[name="${CSS.escape(name)}"]`
      ) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (!el) return;
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    };

    setValue("gender", profile.gender);
    setValue("stageName", profile.name);
    setValue("email", profile.email);
    setValue("password", password);
    if (profile.age !== null && Number.isFinite(profile.age)) {
      setValue("age", String(profile.age));
    }
    setValue("address", profile.location);

    const formFields =
      profile.formFields && typeof profile.formFields === "object" && !Array.isArray(profile.formFields)
        ? profile.formFields
        : {};
    const readText = (key: string) => {
      const raw = formFields[key];
      if (typeof raw === "string") return raw;
      if (Array.isArray(raw)) {
        const first = raw.find((item): item is string => typeof item === "string" && item.trim().length > 0);
        return first ?? "";
      }
      return "";
    };

    for (const [key, raw] of Object.entries(formFields)) {
      if (typeof raw === "string" && raw.trim()) {
        setValue(key, raw);
        continue;
      }

      if (Array.isArray(raw)) {
        const first = raw.find(
          (item): item is string => typeof item === "string" && item.trim().length > 0
        );
        if (first) {
          setValue(key, first);
        }
      }
    }

    setValue("phone", readText("phone"));
    setValue("whatsapp", readText("whatsapp") || readText("whatsappNumber"));
    setValue(
      "telegramUsername",
      readText("telegramUsername") || readText("telegram") || readText("telegramLink")
    );
    setValue("activeOffer", readText("activeOffer"));
    setValue("activeOfferUntil", readText("activeOfferUntil"));
    setValue("nextOffer", readText("nextOffer"));
    setValue("nextOfferFrom", readText("nextOfferFrom"));
    setValue("specialOffer", readText("specialOffer"));
  }, [password]);

  useEffect(() => {
    if (!initialProfile) return;

    window.setTimeout(() => {
      fillForm(initialProfile);
      window.dispatchEvent(new CustomEvent("profile:prefill", { detail: { profile: initialProfile } }));
      try {
        localStorage.setItem("loadedAdProfile", JSON.stringify(initialProfile));
        window.dispatchEvent(new Event("profile:loaded"));
      } catch {
        // ignore storage errors
      }
    }, 0);
  }, [fillForm, initialProfile]);

  const handleLoad = async () => {
    setError("");
    setOk(false);
    setLoading(true);
    try {
      const genderInput = document.querySelector(
        'input[name="gender"]:checked'
      ) as HTMLInputElement | null;
      const genderValue = genderInput?.value ?? "";

      const response = await fetch("/api/profile-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          gender: genderValue,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Failed to load profile.");
        return;
      }

      const data = (await response.json()) as { profile: LoadedProfile };
      const profile = data.profile;
      fillForm(profile);
      window.dispatchEvent(new CustomEvent("profile:prefill", { detail: { profile } }));
      try {
        localStorage.setItem("loadedAdProfile", JSON.stringify(profile));
        window.dispatchEvent(new Event("profile:loaded"));
      } catch {
        // ignore storage errors
      }
      setOk(true);
    } catch {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/5 via-black/40 to-black/70 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.4)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#f5d68c] sm:text-xs sm:tracking-[0.45em]">
            {initialProfile ? "Profile Loaded" : "Profile Access"}
          </p>
          <h3 className="mt-2 text-xl font-semibold sm:mt-3 sm:text-2xl">
            {initialProfile ? "Editing your logged-in profile" : "Load your existing profile"}
          </h3>
          <p className="mt-2 text-sm text-white/60">
            {initialProfile
              ? "Your current ad details are already loaded below. Update the fields and save for admin approval."
              : "Enter the same email and password to edit your profile."}
          </p>
        </div>
        {!initialProfile && (
          <button
            type="button"
            onClick={handleLoad}
            disabled={loading}
            className="w-full rounded-full border border-[#f8dea4] bg-[#f5d68c] px-7 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#07080b] shadow-[0_18px_38px_rgba(245,179,92,0.48)] transition hover:bg-[#ffe5aa] hover:shadow-[0_22px_48px_rgba(245,179,92,0.58)] disabled:opacity-60 sm:w-auto sm:min-w-[190px] sm:text-xs sm:tracking-[0.35em]"
          >
            {loading ? "Loading..." : "Load Profile"}
          </button>
        )}
      </div>

      {!initialProfile && (
        <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 pr-14 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-[#f5d68c]/45 hover:text-[#f5d68c]"
            >
              {showPassword ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m3 3 18 18" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.4 5.4A10.3 10.3 0 0 1 12 5c5 0 8.5 4.2 9.5 7a11.5 11.5 0 0 1-2.7 4.2" />
                  <path d="M6.4 6.6A11.6 11.6 0 0 0 2.5 12c1 2.8 4.5 7 9.5 7 1.5 0 2.8-.4 4-1" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      {ok && (
        <p className="mt-4 text-sm text-green-300">
          Profile loaded. You can now edit and save.
        </p>
      )}
    </div>
  );
}
