"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createOrUpdateProfile } from "./actions";
import Link from "next/link";

type InitialProfile = {
  fullName: string;
  age: number | string;
  location: string;
  bio: string;
  interests: string;
  images: string[];
};

type UploadItem = {
  id: string;
  url: string;
  status: "ready";
};

const initialActionState: {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
} = { ok: false };

export default function ProfileCreateForm({
  initialProfile,
}: {
  initialProfile: InitialProfile | null;
}) {
  const [step, setStep] = useState(1);
  const [uploads, setUploads] = useState<UploadItem[]>(
    initialProfile?.images.map((url, index) => ({
      id: `existing-${index}`,
      url,
      status: "ready",
    })) ?? []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [state, formAction, isPending] = useActionState(
    createOrUpdateProfile,
    initialActionState
  );

  const images = useMemo(() => uploads.map((item) => item.url), [uploads]);
  const canSubmit =
    images.length >= 3 && images.length <= 4 && !isUploading && !isPending;

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((item) => item.id !== id));
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = 4 - uploads.length;
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

      if (!response.ok) {
        setUploadError("Upload failed. Try again.");
        return;
      }

      const data = (await response.json()) as { urls?: string[] };
      if (data.urls?.length) {
        const urls = data.urls;
        setUploads((prev) => [
          ...prev,
          ...urls.map((url) => ({
            id: `upload-${Date.now()}-${Math.random()}`,
            url,
            status: "ready" as const,
          })),
        ]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const onNext = () => setStep((prev) => Math.min(prev + 1, 2));
  const onBack = () => setStep((prev) => Math.max(prev - 1, 1));

  useEffect(() => {
    const fields = state.fieldErrors ?? {};
    if (
      fields.fullName ||
      fields.age ||
      fields.location ||
      fields.bio ||
      fields.interests
    ) {
      setStep(1);
    }
  }, [state.fieldErrors]);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <form id="upload-form" className="hidden" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#f5d68c] sm:text-xs sm:tracking-[0.5em]">
              Profile Studio
            </p>
            <h1
              className="mt-3 text-2xl font-semibold sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {initialProfile ? "Edit your profile" : "Create your profile"}
            </h1>
            <p className="mt-3 text-sm text-white/60">
              Complete both steps to publish your profile.
            </p>
          </div>
          <Link
            href="/profile/me"
            className="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:text-white sm:px-6 sm:text-xs sm:tracking-[0.35em]"
          >
            My Profile
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4 sm:mt-10 sm:p-6">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-white/60 sm:text-xs sm:tracking-[0.35em]">
            <span className={step === 1 ? "text-[#f5d68c]" : ""}>Step 1: Info</span>
            <span className={step === 2 ? "text-[#f5d68c]" : ""}>Step 2: Images</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] transition-all"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        <form action={formAction} className="mt-8 space-y-6 sm:mt-10 sm:space-y-8">
          <input type="hidden" name="images" value={JSON.stringify(images)} />

          <section
            className={`grid gap-6 rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-6 md:grid-cols-2 ${
              step === 1 ? "block" : "hidden"
            }`}
          >
              <div className="space-y-5">
                <label className="block text-sm text-white/70">
                  Full Name
                  <input
                    name="fullName"
                    defaultValue={initialProfile?.fullName ?? ""}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
                  />
                  {state.fieldErrors?.fullName?.[0] && (
                    <span className="mt-2 block text-xs text-red-300">
                      {state.fieldErrors.fullName[0]}
                    </span>
                  )}
                </label>
                <label className="block text-sm text-white/70">
                  Age
                  <input
                    name="age"
                    type="number"
                    min={18}
                    max={80}
                    defaultValue={initialProfile?.age ?? ""}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
                  />
                  {state.fieldErrors?.age?.[0] && (
                    <span className="mt-2 block text-xs text-red-300">
                      {state.fieldErrors.age[0]}
                    </span>
                  )}
                </label>
                <label className="block text-sm text-white/70">
                  Location
                  <input
                    name="location"
                    defaultValue={initialProfile?.location ?? ""}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
                  />
                  {state.fieldErrors?.location?.[0] && (
                    <span className="mt-2 block text-xs text-red-300">
                      {state.fieldErrors.location[0]}
                    </span>
                  )}
                </label>
                <label className="block text-sm text-white/70">
                  Interests (comma separated)
                  <input
                    name="interests"
                    defaultValue={initialProfile?.interests ?? ""}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
                  />
                  {state.fieldErrors?.interests?.[0] && (
                    <span className="mt-2 block text-xs text-red-300">
                      {state.fieldErrors.interests[0]}
                    </span>
                  )}
                </label>
              </div>
              <label className="block text-sm text-white/70">
                Short Bio
                <textarea
                  name="bio"
                  rows={10}
                  defaultValue={initialProfile?.bio ?? ""}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
                />
                {state.fieldErrors?.bio?.[0] && (
                  <span className="mt-2 block text-xs text-red-300">
                    {state.fieldErrors.bio[0]}
                  </span>
                )}
              </label>
          </section>

          {step === 2 && (
            <section className="rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Upload Images</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Minimum 3, maximum 4 images. Stored in Cloudinary.
                  </p>
                </div>
                <label
                  form="upload-form"
                  className="cursor-pointer rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:text-white sm:px-5 sm:text-xs sm:tracking-[0.35em]"
                >
                  Select Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => uploadFiles(event.target.files)}
                    disabled={isUploading || uploads.length >= 4}
                  />
                </label>
              </div>
              {uploadError && (
                <p className="mt-3 text-sm text-red-300">{uploadError}</p>
              )}
              {state.fieldErrors?.images?.[0] && (
                <p className="mt-3 text-sm text-red-300">
                  {state.fieldErrors.images[0]}
                </p>
              )}

              <div className="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2 lg:grid-cols-4">
                {uploads.map((item) => (
                  <div
                    key={item.id}
                    className="relative h-40 overflow-hidden rounded-2xl border border-white/10 bg-black/50 sm:h-48"
                  >
                    <img
                      src={item.url}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeUpload(item.id)}
                      className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/70 transition hover:text-white sm:text-xs sm:tracking-[0.3em]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {uploads.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/20 bg-black/30 p-6 text-sm text-white/60 sm:p-8">
                    No images uploaded yet.
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-white/60">
              {state.error && (
                <p className="text-red-300">{state.error}</p>
              )}
              {state.fieldErrors && (
                <div className="mt-2 text-xs text-red-300">
                  {Object.entries(state.fieldErrors)
                    .flatMap(([, msgs]) => msgs ?? [])
                    .slice(0, 3)
                    .map((msg, idx) => (
                      <p key={`${msg}-${idx}`}>{msg}</p>
                    ))}
                </div>
              )}
              {state.ok && (
                <p className="text-green-300">
                  Profile saved successfully.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:text-white sm:px-6 sm:text-xs sm:tracking-[0.35em]"
                >
                  Back
                </button>
              )}
              {step === 1 && (
                <button
                  type="button"
                  onClick={onNext}
                  className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition hover:brightness-110 sm:px-6 sm:text-xs sm:tracking-[0.35em]"
                >
                  Continue
                </button>
              )}
              {step === 2 && (
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:text-xs sm:tracking-[0.35em]"
                >
                  {isPending ? "Saving..." : "Save Profile"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
