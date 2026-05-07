"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type UploadItem = {
  id: string;
  url: string;
};

type Props = {
  initialImages?: string[];
};

type SavedFormFields = Record<string, string | string[]>;

function serializeFormFields(formData: FormData): SavedFormFields {
  const serialized: SavedFormFields = {};

  for (const [key, rawValue] of formData.entries()) {
    if (typeof rawValue !== "string") continue;
    if (key === "password" || key.toLowerCase().includes("email")) continue;

    const value = rawValue.trim();
    const existing = serialized[key];
    if (existing === undefined) {
      serialized[key] = value;
      continue;
    }

    serialized[key] = Array.isArray(existing)
      ? [...existing, value]
      : [existing, value];
  }

  return serialized;
}

export default function RegistroSubmit({ initialImages = [] }: Props) {
  const minImages = 4;
  const maxImages = 20;
  const [uploads, setUploads] = useState<UploadItem[]>(
    initialImages.map((url, index) => ({
      id: `initial-${index}`,
      url,
    }))
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [missingLabels, setMissingLabels] = useState<string[]>([]);
  const successTimeoutRef = useRef<number | null>(null);

  const images = useMemo(() => uploads.map((item) => item.url), [uploads]);

  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem("loadedAdProfile");
        if (!raw) return;
        const data = JSON.parse(raw) as { images?: string[] };
        if (Array.isArray(data.images)) {
          setUploads(
            data.images.map((url, index) => ({
              id: `loaded-${index}`,
              url,
            }))
          );
        }
      } catch {
        // ignore storage errors
      }
    };
    window.addEventListener("profile:loaded", handler);
    return () => window.removeEventListener("profile:loaded", handler);
  }, []);

  useEffect(() => {
    const handlePrefill = (event: Event) => {
      const profile =
        (event as CustomEvent<{ profile?: { images?: string[] } }>).detail?.profile;
      if (!Array.isArray(profile?.images)) return;

      setUploads(
        profile.images
          .filter((url): url is string => typeof url === "string" && url.trim().length > 0)
          .map((url, index) => ({
            id: `prefill-${index}`,
            url,
          }))
      );
    };

    window.addEventListener("profile:prefill", handlePrefill as EventListener);
    return () => window.removeEventListener("profile:prefill", handlePrefill as EventListener);
  }, []);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current !== null) {
        window.clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((item) => item.id !== id));
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = maxImages - uploads.length;
    const fileList = Array.from(files).slice(0, remaining);
    if (!fileList.length) return;

    setIsUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      fileList.forEach((file) => formData.append("images", file));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const raw = await response.text();
      let parsed: { urls?: string[]; error?: string } | null = null;
      try {
        parsed = raw ? (JSON.parse(raw) as { urls?: string[]; error?: string }) : null;
      } catch {
        parsed = null;
      }

      if (!response.ok) {
        setUploadError(
          parsed?.error ??
            (raw ? `Upload failed: ${raw}` : `Upload failed (${response.status})`)
        );
        return;
      }

      const data = parsed ?? {};
      if (data.urls?.length) {
        const urls = data.urls;
        setUploads((prev) => [
          ...prev,
          ...urls.map((url) => ({
            id: `upload-${Date.now()}-${Math.random()}`,
            url,
          })),
        ]);
      } else {
        setUploadError("Upload failed. No URLs returned.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (successTimeoutRef.current !== null) {
      window.clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    setSaveError("");
    setSaveOk(false);
    setMissingLabels([]);

    if (!legalAccepted) {
      setSaveError(
        "Please accept the terms, conditions, legal notice and private policies before saving."
      );
      setMissingLabels(["Terms and privacy acceptance"]);
      return;
    }

    const normalizedAnswer = securityAnswer.replace(/\s+/g, "").toLowerCase();
    if (normalizedAnswer !== "90") {
      setSaveError("Security answer is incorrect. Please try again.");
      return;
    }

    const form = document.getElementById(
      "registro-escorts-form"
    ) as HTMLFormElement | null;
    if (!form) {
      setSaveError("Form not found.");
      return;
    }

    const formData = new FormData(form);
    const clearErrors = () => {
      form
        .querySelectorAll(".ring-red-500\\/70")
        .forEach((el) => el.classList.remove("ring-2", "ring-red-500/70"));
    };
    const markError = (fieldName: string) => {
      const el = form.querySelector(
        `[name="${CSS.escape(fieldName)}"]`
      ) as HTMLElement | null;
      if (el) {
        el.classList.add("ring-2", "ring-red-500/70");
      }
    };
    clearErrors();

    const fieldLabels: Record<string, string> = {
      gender: "Gender",
      stageName: "Stage name",
      email: "Advertiser email",
      password: "Password",
      phone: "Phone number",
      age: "Age",
      nationality: "Nationality",
      servicesOffered: "Services offered",
      physicalAttributes: "Physical attributes",
      attentionLevel: "Attention level",
      specialFilters: "Special filters",
      languages: "Languages",
      rate20: "Rate 20 min",
      rate30: "Rate 30 min",
      rate45: "Rate 45 min",
      rate60: "Rate 60 min",
      address: "Address",
      mapConfirmation: "Map confirmation",
      subscription: "Subscription",
      paymentMethod: "Payment method",
      activeOffer: "Active offer",
      nextOffer: "Next offer",
      specialOffer: "Special offer",
      featuredBanner: "Featured banner",
      legalAcceptance: "Terms and privacy acceptance",
    };
    const requiredFields = [
      "gender",
      "stageName",
      "email",
      "password",
      "phone",
      "age",
      "nationality",
      "servicesOffered",
      "physicalAttributes",
      "attentionLevel",
      "specialFilters",
      "languages",
      "subscriptionPlan",
      "subscriptionDuration",
      "paymentMethod",
      "legalAcceptance",
    ];

    const missing: string[] = [];
    for (const field of requiredFields) {
      if (
        field === "servicesOffered" ||
        field === "languages" ||
        field === "physicalAttributes" ||
        field === "attentionLevel" ||
        field === "specialFilters"
      ) {
        const values = formData
          .getAll(field)
          .map((item) => String(item).trim())
          .filter(Boolean);
        if (values.length === 0) {
          missing.push(field);
          markError(field);
        }
        continue;
      }
      const value = String(formData.get(field) ?? "").trim();
      if (!value) {
        missing.push(field);
        markError(field);
      }
    }

    const scheduleDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    for (const day of scheduleDays) {
      const start = String(formData.get(`schedule-${day}-start`) ?? "").trim();
      const end = String(formData.get(`schedule-${day}-end`) ?? "").trim();
      if (!start || !end) {
        if (!start) {
          const key = `schedule-${day}-start`;
          missing.push(key);
          markError(key);
        }
        if (!end) {
          const key = `schedule-${day}-end`;
          missing.push(key);
          markError(key);
        }
      }
    }
    if (missing.length > 0) {
      const labels = missing
        .map((field) => fieldLabels[field] ?? field)
        .filter(Boolean);
      setMissingLabels(labels.slice(0, 8));
      setSaveError("Please complete all 6 steps before saving.");
      return;
    }

    const gender = String(formData.get("gender") ?? "").trim();
    const name = String(formData.get("stageName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const ageValue = String(formData.get("age") ?? "").trim();
    const location = String(formData.get("address") ?? "").trim();
    const age = Number(ageValue);
    const formFields = serializeFormFields(formData);

    if (images.length < minImages) {
      setSaveError(`Please upload at least ${minImages} images.`);
      return;
    }
    if (images.length > maxImages) {
      setSaveError(`Please upload no more than ${maxImages} images.`);
      return;
    }

    setIsSaving(true);
    try {
      const endpoint = gender === "trans" ? "/api/trans" : "/api/girls";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age,
          location,
          images,
          gender,
          email,
          password,
          formFields,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setSaveError(data.error ?? "Failed to save.");
        return;
      }

      await response.json().catch(() => null);
      const target = gender === "trans" ? "trans" : "girls";
      setSaveOk(true);
      successTimeoutRef.current = window.setTimeout(() => {
        setSaveOk(false);
        successTimeoutRef.current = null;
      }, 20_000);
      try {
        const payload = {
          name,
          age,
          location,
          images,
          createdAt: new Date().toISOString(),
          gender: target,
        };
        localStorage.setItem("lastAdProfile", JSON.stringify(payload));
      } catch {
        // ignore storage errors
      }
    } catch {
      setSaveError("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="rounded-[30px] border border-white/10 bg-[#0c0d10] p-5 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-[#f5d68c]">
          Final Step
        </p>
        <h2 className="mt-3 text-2xl font-semibold sm:mt-4 sm:text-4xl">
          Save your ad and upload photos
        </h2>
        <p className="mt-2 text-sm text-white/60 sm:mt-3">
          Answer the security question to continue.
        </p>

        <div className="mt-6 rounded-[26px] border border-white/10 bg-gradient-to-br from-white/5 via-black/40 to-black/70 p-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:mt-8 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/60 text-sm font-semibold text-[#f5d68c]">
                Q
              </span>
              <div>
                <p className="text-sm font-semibold tracking-wide">
                  Security Check
                </p>
                <p className="text-xs text-white/60">
                  Please answer to confirm you are human.
                </p>
              </div>
            </div>
            <span className="rounded-full border border-white/10 bg-black/50 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white/60 sm:px-4 sm:tracking-[0.35em]">
              Quick Math
            </span>
          </div>

          <div className="mt-4 sm:mt-5">
            <label className="text-[10px] uppercase tracking-[0.3em] text-white/60 sm:text-xs sm:tracking-[0.35em]">
              100 minus 10 = ?
            </label>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/70 px-4 py-3 focus-within:border-[#f5d68c]/60">
              <span className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-white/40 sm:text-xs sm:tracking-[0.24em]">
                Answer
              </span>
              <input
                placeholder="Type your answer"
                value={securityAnswer}
                onChange={(event) => setSecurityAnswer(event.target.value)}
                className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-left sm:mt-8 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Upload photos</p>
              <p className="mt-1 text-xs text-white/60">
                Minimum 4, maximum 20 images. Stored in Cloudinary.
              </p>
            </div>
            <label className="cursor-pointer rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:text-white sm:px-5 sm:text-xs sm:tracking-[0.35em]">
              Select Images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => uploadFiles(event.target.files)}
                disabled={isUploading || uploads.length >= maxImages}
              />
            </label>
          </div>
          {uploadError && (
            <p className="mt-3 text-sm text-red-300">{uploadError}</p>
          )}

          <div className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2 lg:grid-cols-4">
            {uploads.map((item) => (
              <div
                key={item.id}
                className="relative h-40 overflow-hidden rounded-2xl border border-white/10 bg-black/50"
              >
                <Image
                  src={item.url}
                  alt="Upload preview"
                  fill
                  sizes="(max-width: 640px) 88vw, (max-width: 1024px) 42vw, 18vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeUpload(item.id)}
                  className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:text-white"
                >
                  Remove
                </button>
              </div>
            ))}
            {uploads.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/20 bg-black/30 p-6 text-sm text-white/60">
                No images uploaded yet.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-[#f5d68c]/25 bg-[linear-gradient(145deg,rgba(245,214,140,0.14),rgba(245,179,92,0.04)_35%,rgba(0,0,0,0.62))] p-1 text-left shadow-[0_22px_52px_rgba(0,0,0,0.35)] sm:mt-8">
          <label className="group flex cursor-pointer flex-col gap-4 rounded-[24px] border border-white/10 bg-[#090a0d]/80 p-4 transition hover:border-[#f5d68c]/45 sm:flex-row sm:items-start sm:p-5">
            <span className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#f5d68c]/40 bg-black/45 text-[#f5d68c] shadow-[0_12px_28px_rgba(245,214,140,0.12)] transition group-hover:border-[#f5d68c]/70">
              <input
                type="checkbox"
                name="legalAcceptance"
                value="accepted"
                checked={legalAccepted}
                onChange={(event) => setLegalAccepted(event.target.checked)}
                className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 scale-75 opacity-0 transition peer-checked:scale-100 peer-checked:opacity-100"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f5d68c] sm:text-xs">
                Legal confirmation
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-white/78 sm:text-base">
                I accept all terms, conditions, legal notice and private
                policies as described on this website and by law.
              </span>
            </span>
          </label>
          {!legalAccepted && (
            <p className="px-4 pb-4 pt-3 text-center text-xs uppercase tracking-[0.18em] text-[#f5d68c]/70 sm:text-left">
              Accept this confirmation to unlock profile submission.
            </p>
          )}
        </div>

        {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
        {missingLabels.length > 0 && (
          <p className="mt-2 text-xs text-red-300">
            Missing: {missingLabels.join(", ")}
          </p>
        )}
        {saveOk && (
          <div
            role="status"
            className="mt-5 rounded-2xl border border-green-300/30 bg-green-300/10 px-4 py-4 text-sm leading-relaxed text-green-100 shadow-[0_16px_36px_rgba(0,0,0,0.24)]"
          >
            We have received your registration and the Hot Barcelona Admin Team
            will contact you soon by WhatsApp and/or email.
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !legalAccepted}
          className="mt-6 rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-7 py-2.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-black shadow-[0_18px_34px_rgba(245,179,92,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-45 sm:mt-8 sm:px-10 sm:py-3 sm:text-xs sm:tracking-[0.35em]"
        >
          {isSaving ? "Saving..." : "Save ad & upload photos"}
        </button>
      </div>
    </section>
  );
}
