"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

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
}: {
  profileId: string;
  profileType: ProfileType;
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
      setSuccess("Review submitted successfully.");
    } catch {
      setError("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
      <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">Reviews</p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="text-2xl font-semibold text-white">
          {data.averageRating.toFixed(1)}
        </div>
        <div className="flex items-center gap-1 text-[#f5d68c]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={`avg-${index}`} filled={index < Math.round(data.averageRating)} />
          ))}
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          {data.totalReviews} reviews
        </p>
      </div>

      {status === "authenticated" ? (
        <form onSubmit={submitReview} className="mt-6 grid gap-3">
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
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-white/60">Loading reviews...</p>
        ) : data.reviews.length === 0 ? (
          <p className="text-sm text-white/60">No reviews yet.</p>
        ) : (
          data.reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white/85">{review.userName}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-1 text-[#f5d68c]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={`${review.id}-${index}`} filled={index < review.rating} />
                ))}
              </div>
              <p className="mt-2 text-sm text-white/70">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
