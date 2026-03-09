import { Suspense } from "react";
import PageShell from "@/components/PageShell";
import ResetPasswordClient from "./reset-password-client";

function ResetPasswordFallback() {
  return (
    <PageShell centered>
        <div className="rounded-3xl border border-white/10 bg-black/40 p-8">
          <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
            Password Reset
          </p>
          <p className="mt-4 text-sm text-white/60">Loading reset form...</p>
        </div>
    </PageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
