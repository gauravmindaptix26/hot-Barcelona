import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

const staticRoutes = [
  "",
  "/girls",
  "/trans-escorts",
  "/contact",
  "/registro-escorts",
  "/legal-notice",
  "/privacy-policy",
  "/login",
  "/register",
  "/forgot-password",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/girls" || route === "/trans-escorts" ? 0.9 : 0.7,
  }));
}
