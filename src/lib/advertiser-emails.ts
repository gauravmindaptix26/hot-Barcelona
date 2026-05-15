import { sendEmail } from "@/lib/email";

function getSupportEmail() {
  const raw =
    process.env.REGISTRATION_SUPPORT_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ||
    "support@hot-barcelona.co";
  // Strip display name e.g. "Hot Barcelona <support@...>" → "support@..."
  const match = raw.match(/<([^<>@\s]+@[^<>@\s]+)>/);
  return match?.[1]?.trim() || raw;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emailShell(bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:580px;margin:0 auto;background:#0a0b0d;border-radius:16px;overflow:hidden;border:1px solid rgba(245,214,140,0.18)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a1408 0%,#0a0b0d 100%);padding:28px 36px;border-bottom:1px solid rgba(245,214,140,0.18)">
      <p style="margin:0;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#f5d68c">Hot Barcelona</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 36px">
      ${bodyHtml}
    </div>

    <!-- Footer -->
    <div style="padding:18px 36px;border-top:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.025)">
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.28);line-height:1.5">
        Hot Barcelona &middot; This email was sent automatically.
        If you have questions reply to <a href="mailto:${getSupportEmail()}" style="color:rgba(245,214,140,0.55)">${getSupportEmail()}</a>.
      </p>
    </div>

  </div>
</body>
</html>`;
}

/* ─── 1. Profile submitted (brand new) ────────────────────────────────────── */

export async function sendProfileSubmittedEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  if (!email) return;
  const safeName = escapeHtml(name || "Advertiser");

  const html = emailShell(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:700">Profile received!</h2>
    <p style="margin:0 0 20px;font-size:13px;letter-spacing:0.28em;text-transform:uppercase;color:#f5d68c">Under review</p>

    <p style="margin:0 0 16px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.65">
      Hello <strong style="color:#fff">${safeName}</strong>,
    </p>
    <p style="margin:0 0 16px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.65">
      Thank you for creating your profile on <strong style="color:#f5d68c">Hot Barcelona</strong>.
      Your profile has been successfully submitted and is now <strong style="color:#fff">awaiting admin review</strong>.
    </p>

    <div style="margin:24px 0;padding:18px 20px;background:rgba(245,214,140,0.07);border-left:3px solid #f5d68c;border-radius:0 8px 8px 0">
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6">
        <strong style="color:#f5d68c">What happens next?</strong><br>
        Our admin team will review your profile and photos. Once approved, your ad will go live on the website.
        You will receive another email as soon as it is approved.
      </p>
    </div>

    <p style="margin:0;color:rgba(255,255,255,0.45);font-size:13px;line-height:1.6">
      If you need to make changes in the meantime, simply return to the Advertise page and use the same email and password to reload your profile.
    </p>
  `);

  const text = [
    `Hello ${name || "Advertiser"},`,
    "",
    "Thank you for creating your profile on Hot Barcelona.",
    "Your profile has been submitted and is awaiting admin review.",
    "",
    "What happens next?",
    "Our team will review your profile and photos. Once approved, your ad will go live.",
    "You will receive another email when it is approved.",
    "",
    "Hot Barcelona",
  ].join("\n");

  try {
    await sendEmail({
      to: email,
      subject: "Hot Barcelona — Your profile has been submitted",
      html,
      text,
    });
  } catch (err) {
    console.error(
      "[advertiser email] submit failed:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

/* ─── 2. Profile re-submitted (existing profile updated) ───────────────────── */

export async function sendProfileResubmittedEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  if (!email) return;
  const safeName = escapeHtml(name || "Advertiser");

  const html = emailShell(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:700">Profile update received!</h2>
    <p style="margin:0 0 20px;font-size:13px;letter-spacing:0.28em;text-transform:uppercase;color:#f5d68c">Pending re-approval</p>

    <p style="margin:0 0 16px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.65">
      Hello <strong style="color:#fff">${safeName}</strong>,
    </p>
    <p style="margin:0 0 16px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.65">
      We have received your updated profile on <strong style="color:#f5d68c">Hot Barcelona</strong>.
      Your changes — including any new photos — are now <strong style="color:#fff">pending admin review</strong>.
    </p>

    <div style="margin:24px 0;padding:18px 20px;background:rgba(245,214,140,0.07);border-left:3px solid #f5d68c;border-radius:0 8px 8px 0">
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6">
        <strong style="color:#f5d68c">What happens next?</strong><br>
        Our admin team will review your changes. New photos are checked individually.
        Once approved, your updated profile will be visible on the website.
        You will receive a confirmation email when everything is approved.
      </p>
    </div>

    <p style="margin:0;color:rgba(255,255,255,0.45);font-size:13px;line-height:1.6">
      Your previous approved content remains live while the new version is under review.
    </p>
  `);

  const text = [
    `Hello ${name || "Advertiser"},`,
    "",
    "We have received your updated profile on Hot Barcelona.",
    "Your changes — including any new photos — are pending admin review.",
    "",
    "What happens next?",
    "Our team will review your changes. New photos are checked individually.",
    "Once approved, your updated profile will be visible on the website.",
    "You will receive an email when everything is approved.",
    "",
    "Hot Barcelona",
  ].join("\n");

  try {
    await sendEmail({
      to: email,
      subject: "Hot Barcelona — Your profile update is under review",
      html,
      text,
    });
  } catch (err) {
    console.error(
      "[advertiser email] resubmit failed:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

/* ─── 3. Profile rejected by admin ─────────────────────────────────────────── */

export async function sendProfileRejectedEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  if (!email) return;
  const safeName = escapeHtml(name || "Advertiser");
  const supportEmail = getSupportEmail();

  const html = emailShell(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:700">Profile not approved</h2>
    <p style="margin:0 0 20px;font-size:13px;letter-spacing:0.28em;text-transform:uppercase;color:#f87171">Action required</p>

    <p style="margin:0 0 16px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.65">
      Hello <strong style="color:#fff">${safeName}</strong>,
    </p>
    <p style="margin:0 0 16px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.65">
      Unfortunately your profile on <strong style="color:#f5d68c">Hot Barcelona</strong> has
      <strong style="color:#f87171">not been approved</strong> in its current state.
      This is usually due to content that does not meet our guidelines.
    </p>

    <div style="margin:24px 0;padding:18px 20px;background:rgba(248,113,113,0.07);border-left:3px solid #f87171;border-radius:0 8px 8px 0">
      <p style="margin:0 0 10px;font-size:13px;color:rgba(255,255,255,0.75);font-weight:700">Common reasons for rejection:</p>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:rgba(255,255,255,0.55);line-height:1.8">
        <li>Photos do not meet our quality or content standards</li>
        <li>Profile information is incomplete or inaccurate</li>
        <li>Content violates our terms and conditions</li>
        <li>Duplicate or misleading profile details</li>
      </ul>
    </div>

    <div style="margin:24px 0;padding:18px 20px;background:rgba(245,214,140,0.07);border-left:3px solid #f5d68c;border-radius:0 8px 8px 0">
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6">
        <strong style="color:#f5d68c">What to do next:</strong><br>
        Return to the Advertise page, load your profile with your email and password,
        update the relevant information and photos, then resubmit for review.
        If you believe this was a mistake, contact us at
        <a href="mailto:${supportEmail}" style="color:#f5d68c">${supportEmail}</a>.
      </p>
    </div>

    <p style="margin:0;color:rgba(255,255,255,0.45);font-size:13px;line-height:1.6">
      Hot Barcelona — we look forward to working with you once the profile meets our standards.
    </p>
  `);

  const text = [
    `Hello ${name || "Advertiser"},`,
    "",
    "Unfortunately your profile on Hot Barcelona has not been approved.",
    "",
    "Common reasons: photos not meeting quality standards, incomplete information,",
    "content violating terms, or duplicate/misleading details.",
    "",
    "What to do next:",
    "Return to the Advertise page, load your profile with your email and password,",
    `update and resubmit. Questions? Contact us at ${supportEmail}.`,
    "",
    "Hot Barcelona",
  ].join("\n");

  try {
    await sendEmail({
      to: email,
      subject: "Hot Barcelona — Your profile requires updates",
      html,
      text,
    });
  } catch (err) {
    console.error(
      "[advertiser email] rejection failed:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

/* ─── 4. Individual photos rejected by admin ────────────────────────────────── */

export async function sendPhotosRejectedEmail({
  name,
  email,
  rejectedPhotoNumbers,
  totalPhotos,
}: {
  name: string;
  email: string;
  rejectedPhotoNumbers: number[];
  totalPhotos: number;
}) {
  if (!email || rejectedPhotoNumbers.length === 0) return;
  const safeName = escapeHtml(name || "Advertiser");
  const supportEmail = getSupportEmail();
  const count = rejectedPhotoNumbers.length;
  const photoWord = count === 1 ? "photo" : "photos";
  const numberList = rejectedPhotoNumbers
    .map((n) => `<strong style="color:#f87171">Photo #${n}</strong>`)
    .join(", ");
  const numberListText = rejectedPhotoNumbers.map((n) => `Photo #${n}`).join(", ");

  const html = emailShell(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:700">${count} ${photoWord} rejected</h2>
    <p style="margin:0 0 20px;font-size:13px;letter-spacing:0.28em;text-transform:uppercase;color:#f87171">Photo review update</p>

    <p style="margin:0 0 16px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.65">
      Hello <strong style="color:#fff">${safeName}</strong>,
    </p>
    <p style="margin:0 0 16px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.65">
      Our admin team has reviewed your photos on <strong style="color:#f5d68c">Hot Barcelona</strong>.
      <strong style="color:#f87171">${count} out of ${totalPhotos} ${photoWord}</strong> did not meet our content guidelines
      and have been marked as rejected.
    </p>

    <div style="margin:24px 0;padding:18px 20px;background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.25);border-radius:10px">
      <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#f87171;font-weight:700">Rejected photos</p>
      <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.82);line-height:1.7">${numberList}</p>
      <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.38)">(numbered in the order they appear on your profile)</p>
    </div>

    <div style="margin:24px 0;padding:18px 20px;background:rgba(248,113,113,0.07);border-left:3px solid #f87171;border-radius:0 8px 8px 0">
      <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.75);font-weight:700">Common reasons a photo is rejected:</p>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:rgba(255,255,255,0.55);line-height:1.8">
        <li>Low image quality or resolution</li>
        <li>Watermarks, logos or text overlays</li>
        <li>Content does not meet our community guidelines</li>
        <li>Image already used on another platform or profile</li>
        <li>Face clearly identifiable without consent notation</li>
      </ul>
    </div>

    <div style="margin:24px 0;padding:18px 20px;background:rgba(245,214,140,0.07);border-left:3px solid #f5d68c;border-radius:0 8px 8px 0">
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6">
        <strong style="color:#f5d68c">How to fix this:</strong><br>
        1. Go to the Advertise page and load your profile with your email and password.<br>
        2. Remove the rejected ${photoWord} and upload new compliant replacements.<br>
        3. Save your profile — it will be sent back to admin for approval automatically.<br><br>
        If you have questions, contact us at
        <a href="mailto:${supportEmail}" style="color:#f5d68c">${supportEmail}</a>.
      </p>
    </div>

    <p style="margin:0;color:rgba(255,255,255,0.45);font-size:13px;line-height:1.6">
      Your other approved photos remain visible on the website in the meantime.
    </p>
  `);

  const text = [
    `Hello ${name || "Advertiser"},`,
    "",
    `${count} out of ${totalPhotos} ${photoWord} on your Hot Barcelona profile have been rejected.`,
    "",
    `Rejected: ${numberListText}`,
    "(numbered in the order they appear on your profile)",
    "",
    "Common reasons: low quality, watermarks, guideline violations, duplicate images.",
    "",
    "How to fix:",
    "1. Go to the Advertise page and load your profile.",
    `2. Remove the rejected ${photoWord} and upload new ones.`,
    "3. Save — it will go back to admin for approval automatically.",
    "",
    `Questions? Contact ${supportEmail}`,
    "",
    "Hot Barcelona",
  ].join("\n");

  try {
    await sendEmail({
      to: email,
      subject: `Hot Barcelona — ${count} ${photoWord} need to be replaced`,
      html,
      text,
    });
  } catch (err) {
    console.error(
      "[advertiser email] photos rejected failed:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

/* ─── 5. Profile approved by admin ─────────────────────────────────────────── */

export async function sendProfileApprovedEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  if (!email) return;
  const safeName = escapeHtml(name || "Advertiser");

  const html = emailShell(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:700">Your profile is approved!</h2>
    <p style="margin:0 0 20px;font-size:13px;letter-spacing:0.28em;text-transform:uppercase;color:#4ade80">Live on Hot Barcelona</p>

    <p style="margin:0 0 16px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.65">
      Hello <strong style="color:#fff">${safeName}</strong>,
    </p>
    <p style="margin:0 0 16px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.65">
      Great news! Your profile on <strong style="color:#f5d68c">Hot Barcelona</strong> has been
      <strong style="color:#4ade80">approved by our admin team</strong>.
      Your ad is now visible on the website according to your selected plan and visibility settings.
    </p>

    <div style="margin:24px 0;padding:18px 20px;background:rgba(74,222,128,0.06);border-left:3px solid #4ade80;border-radius:0 8px 8px 0">
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6">
        <strong style="color:#4ade80">Want to make changes?</strong><br>
        You can log in or return to the Advertise page and use your email and password to update your profile, add photos, or adjust your schedule at any time.
      </p>
    </div>

    <p style="margin:0;color:rgba(255,255,255,0.45);font-size:13px;line-height:1.6">
      Thank you for choosing Hot Barcelona. We wish you great success!
    </p>
  `);

  const text = [
    `Hello ${name || "Advertiser"},`,
    "",
    "Great news! Your profile on Hot Barcelona has been approved by our admin team.",
    "Your ad is now visible on the website.",
    "",
    "Want to make changes?",
    "Log in or return to the Advertise page to update your profile at any time.",
    "",
    "Thank you for choosing Hot Barcelona!",
    "",
    "Hot Barcelona",
  ].join("\n");

  try {
    await sendEmail({
      to: email,
      subject: "Hot Barcelona — Your profile has been approved ✓",
      html,
      text,
    });
  } catch (err) {
    console.error(
      "[advertiser email] approval failed:",
      err instanceof Error ? err.message : String(err)
    );
  }
}
