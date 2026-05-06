type CloudinaryImageOptions = {
  width: number;
  height?: number;
  crop?: "fill" | "limit";
  quality?: "auto" | number;
};

export function getCloudinaryImageUrl(
  src: string,
  { width, height, crop = "fill", quality = "auto" }: CloudinaryImageOptions
) {
  if (!src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) {
    return src;
  }

  const qualityValue = quality === "auto" ? "q_auto" : `q_${quality}`;
  const parts = [`f_auto`, qualityValue, `c_${crop}`, `w_${width}`];
  if (height) {
    parts.push(`h_${height}`);
  }
  if (crop === "fill") {
    parts.push("g_auto");
  }

  return src.replace("/image/upload/", `/image/upload/${parts.join(",")}/`);
}
