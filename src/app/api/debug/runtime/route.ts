import { NextResponse } from "next/server";
import { getCloudinaryAdsFolder } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const appEnv = process.env.APP_ENV ?? null;
  const vercelEnv = process.env.VERCEL_ENV ?? null;
  const nodeEnv = process.env.NODE_ENV ?? null;
  const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

  return NextResponse.json({
    ok: true,
    now: new Date().toISOString(),
    appEnv,
    vercelEnv,
    nodeEnv,
    cloudinaryConfigured,
    cloudinaryAdsFolder: getCloudinaryAdsFolder(),
  });
}
