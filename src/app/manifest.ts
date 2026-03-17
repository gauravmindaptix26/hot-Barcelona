import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hot Barcelona",
    short_name: "Hot Barcelona",
    description:
      "Premium escort and companion portal for Barcelona with discreet profiles and elegant private experiences.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0b0d",
    theme_color: "#0a0b0d",
    icons: [
      {
        src: "/images/added%20logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/added%20logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
