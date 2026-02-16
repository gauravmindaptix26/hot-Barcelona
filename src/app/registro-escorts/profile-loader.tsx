"use client";

import { useState } from "react";

type LoadedProfile = {
  gender: "girl" | "trans";
  name: string;
  age: number | null;
  location: string;
  images: string[];
  email: string;
};

export default function ProfileLoader() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const fillForm = (profile: LoadedProfile) => {
    const form = document.getElementById(
      "registro-escorts-form"
    ) as HTMLFormElement | null;
    if (!form) return;

    const setValue = (name: string, value: string) => {
      const el = form.querySelector(
        `[name="${CSS.escape(name)}"]`
      ) as HTMLInputElement | HTMLSelectElement | null;
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
  };

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
    <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/5 via-black/40 to-black/70 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">
            Profile Access
          </p>
          <h3 className="mt-3 text-2xl font-semibold">
            Load your existing profile
          </h3>
          <p className="mt-2 text-sm text-white/60">
            Enter the same email and password to edit your profile.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoad}
          disabled={loading}
          className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.35)] transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Loading..." : "Load Profile"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      {ok && (
        <p className="mt-4 text-sm text-green-300">
          Profile loaded. You can now edit and save.
        </p>
      )}
    </div>
  );
}
