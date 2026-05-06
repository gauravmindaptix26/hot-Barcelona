"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-image";

type ProfileType = "girls" | "trans" | "profiles";

type Review = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string | null;
};

type ReviewResponse = {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  myReview?: {
    rating: number;
    comment: string;
    approvalStatus?: "pending" | "approved" | "rejected";
  } | null;
};

const formatDate = (value: string | null) => {
  if (!value) return "Unknown date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";
  return parsed.toLocaleDateString();
};

function Star({
  filled,
  className = "",
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-4 w-4 ${className}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 3.5l2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.9L12 3.5Z" />
    </svg>
  );
}

export default function ProfileReviews({
  profileId,
  profileType,
  profileName,
  heroImage,
  gallery = [],
}: {
  profileId: string;
  profileType: ProfileType;
  profileName: string;
  heroImage?: string | null;
  gallery?: string[];
}) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [data, setData] = useState<ReviewResponse>({
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
    myReview: null,
  });

  const canSubmit = useMemo(() => {
    return comment.trim().length >= 3 && rating >= 1 && rating <= 5;
  }, [comment, rating]);
  const mediaItems = useMemo(() => {
    return Array.from(new Set([heroImage, ...gallery].filter((item): item is string => Boolean(item))))
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);
  }, [gallery, heroImage]);

  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/profile-reviews?profileId=${encodeURIComponent(
          profileId
        )}&profileType=${encodeURIComponent(profileType)}`,
        { cache: "no-store" }
      );
      const payload = (await response.json()) as ReviewResponse & { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to load reviews.");
        return;
      }
      setData(payload);
      if (payload.myReview) {
        setRating(payload.myReview.rating);
        setComment(payload.myReview.comment);
      } else {
        setRating(5);
        setComment("");
      }
    } catch {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, profileType, session?.user?.id]);

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setError("Please set rating and write at least 3 characters.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/profile-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          profileType,
          rating,
          comment: comment.trim(),
        }),
      });
      const payload = (await response.json()) as ReviewResponse & { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to submit review.");
        return;
      }
      setData(payload);
      setSuccess("Review submitted. Awaiting approval.");
    } catch {
      setError("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(10,11,13,0.94)_42%)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_320px]">
        <div className="p-5 sm:p-7">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#f5d68c] sm:text-xs sm:tracking-[0.45em]">
            Feedback
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="text-3xl font-semibold text-white">
              {data.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 text-[#f5d68c]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={`avg-${index}`} filled={index < Math.round(data.averageRating)} />
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/60 sm:text-xs">
              {data.totalReviews} reviews
            </p>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
            Reviews for {profileName} are shown with profile images so the section feels like part of the profile, not a separate plain box.
          </p>

          {status === "authenticated" ? (
            <form onSubmit={submitReview} className="mt-6 grid gap-3 rounded-[24px] border border-white/10 bg-black/25 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-[0.25em] text-white/60">
                  Your rating
                </span>
                <div className="flex items-center gap-1 text-[#f5d68c]">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const current = index + 1;
                    return (
                      <button
                        key={`select-${current}`}
                        type="button"
                        onClick={() => setRating(current)}
                        className="rounded p-1 transition hover:bg-white/10"
                        aria-label={`Set rating ${current}`}
                      >
                        <Star filled={current <= rating} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                placeholder="Write your review"
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
              />

              <button
                type="submit"
                disabled={submitting || !canSubmit}
                className="w-fit rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Submit Review"}
              </button>
            </form>
          ) : status === "loading" ? (
            <p className="mt-6 text-sm text-white/60">Loading account status...</p>
          ) : (
            <p className="mt-6 text-sm text-white/60">
              Login required to post review.{" "}
              <Link href="/login" className="text-[#f5d68c]">
                Login
              </Link>
            </p>
          )}

          {success && <p className="mt-4 text-sm text-green-300">{success}</p>}
          {data.myReview?.approvalStatus === "pending" && (
            <p className="mt-4 text-sm font-semibold text-red-300">
              Awaiting approval
            </p>
          )}
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="text-sm text-white/60">Loading reviews...</p>
            ) : data.reviews.length === 0 ? (
              <p className="text-sm text-white/60">No reviews yet.</p>
            ) : (
              data.reviews.map((review, index) => {
                const cardImage = mediaItems[index % Math.max(mediaItems.length, 1)];
                return (
                  <article
                    key={review.id}
                    className="overflow-hidden rounded-[24px] border border-white/10 bg-black/30"
                  >
                    <div className="grid gap-0 sm:grid-cols-[150px_minmax(0,1fr)]">
                      <div className="relative min-h-[160px] border-b border-white/10 bg-black/40 sm:min-h-full sm:border-b-0 sm:border-r">
                        {cardImage ? (
                          <Image
                            src={getCloudinaryImageUrl(cardImage, {
                              width: 300,
                              height: 320,
                            })}
                            alt={`${profileName} review visual`}
                            fill
                            sizes="(max-width: 640px) 100vw, 150px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,214,140,0.28),rgba(10,11,13,0.96)_70%)]" />
                        )}
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0.05),rgba(10,11,13,0.55))]" />
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-white/85">{review.userName}</p>
                          <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-[#f5d68c]">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star key={`${review.id}-${starIndex}`} filled={starIndex < review.rating} />
                          ))}
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-white/72">{review.comment}</p>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <aside className="border-t border-white/10 bg-black/20 lg:border-t-0 lg:border-l">
          <div className="grid h-full gap-3 p-4 sm:p-5">
            <div className="relative min-h-[220px] overflow-hidden rounded-[24px] border border-white/10 bg-black/40">
              {mediaItems[0] ? (
                <Image
                  src={getCloudinaryImageUrl(mediaItems[0], {
                    width: 640,
                    height: 520,
                  })}
                  alt={`${profileName} profile preview`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 320px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,214,140,0.24),rgba(10,11,13,0.98)_72%)]" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0.08),rgba(10,11,13,0.68))]" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5d68c]">
                  Profile Visuals
                </p>
                <p className="mt-2 text-sm text-white/80">
                  Feedback section now sits with profile images for a richer presentation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {mediaItems.slice(1, 3).map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="relative aspect-[4/5] overflow-hidden rounded-[20px] border border-white/10 bg-black/40"
                >
                  <Image
                    src={getCloudinaryImageUrl(item, {
                      width: 300,
                      height: 380,
                    })}
                    alt={`${profileName} gallery preview ${index + 2}`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 150px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0.04),rgba(10,11,13,0.45))]" />
                </div>
              ))}
              {mediaItems.length < 3 &&
                Array.from({ length: 3 - mediaItems.length }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="aspect-[4/5] rounded-[20px] border border-dashed border-white/10 bg-[linear-gradient(145deg,rgba(245,214,140,0.08),rgba(255,255,255,0.02),rgba(10,11,13,0.78))]"
                  />
                ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
