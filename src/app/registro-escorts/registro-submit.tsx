"use client";

import { useEffect, useMemo, useState } from "react";

type UploadItem = {
  id: string;
  url: string;
};

type Props = {
  initialImages?: string[];
};

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
  const [savedTarget, setSavedTarget] = useState<"girls" | "trans">("girls");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [missingLabels, setMissingLabels] = useState<string[]>([]);

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
    setSaveError("");
    setSaveOk(false);
    setMissingLabels([]);

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
      email: "Email",
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
      featuredBanner: "Featured banner",
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
      "rate20",
      "rate30",
      "rate45",
      "rate60",
      "address",
    ];

    const missing: string[] = [];
    for (const field of requiredFields) {
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
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setSaveError(data.error ?? "Failed to save.");
        return;
      }

      await response.json().catch(() => null);
      const target = gender === "trans" ? "trans" : "girls";
      setSavedTarget(target);
      setSaveOk(true);
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
      setTimeout(() => {
        window.location.href = target === "trans" ? "/trans-escorts" : "/girls";
      }, 800);
    } catch {
      setSaveError("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-6 pb-28">
      <div className="rounded-[30px] border border-white/10 bg-[#0c0d10] p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <p className="text-xs uppercase tracking-[0.4em] text-[#f5d68c]">
          Final Step
        </p>
        <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
          Save your ad and upload photos
        </h2>
        <p className="mt-3 text-sm text-white/60">
          Answer the security question to continue.
        </p>

        <div className="mt-8 rounded-[26px] border border-white/10 bg-gradient-to-br from-white/5 via-black/40 to-black/70 p-6 text-left shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
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
            <span className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-white/60">
              Quick Math
            </span>
          </div>

          <div className="mt-5">
            <label className="text-xs uppercase tracking-[0.35em] text-white/60">
              100 minus 10 = ?
            </label>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/70 px-4 py-3 focus-within:border-[#f5d68c]/60">
              <span className="text-xs uppercase tracking-[0.3em] text-white/40">
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

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Upload photos</p>
              <p className="mt-1 text-xs text-white/60">
                Minimum 4, maximum 20 images. Stored in Cloudinary.
              </p>
            </div>
            <label className="cursor-pointer rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.35em] text-white/70 transition hover:text-white">
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

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {uploads.map((item) => (
              <div
                key={item.id}
                className="relative h-40 overflow-hidden rounded-2xl border border-white/10 bg-black/50"
              >
                <img
                  src={item.url}
                  alt="Upload preview"
                  className="h-full w-full object-cover"
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

        {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
        {missingLabels.length > 0 && (
          <p className="mt-2 text-xs text-red-300">
            Missing: {missingLabels.join(", ")}
          </p>
        )}
        {saveOk && (
          <p className="mt-4 text-sm text-green-300">
            Saved successfully. It will appear on the{" "}
            {savedTarget === "trans" ? "trans" : "girls"} page.
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="mt-8 rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-10 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_18px_34px_rgba(245,179,92,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save ad & upload photos"}
        </button>
      </div>
    </section>
  );
}
