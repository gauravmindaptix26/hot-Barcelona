// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limit";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { files: 4, fileSize: 5 * 1024 * 1024 },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const limiter = rateLimit(`upload:${req.socket.remoteAddress ?? "local"}`, 10, 60_000);
  if (!limiter.allowed) {
    return res.status(429).json({ error: "Too many uploads" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  upload.array("images", 4)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: "Upload failed" });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ error: "Cloudinary is not configured" });
    }

    const files = (req as NextApiRequest & { files?: { buffer: Buffer }[] }).files ?? [];
    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signatureBase = `timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const urls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append(
          "file",
          `data:image/jpeg;base64,${file.buffer.toString("base64")}`
        );
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          return res.status(400).json({ error: "Upload failed" });
        }

        const data = (await response.json()) as { secure_url?: string };
        if (data.secure_url) {
          urls.push(data.secure_url);
        }
      }

      return res.status(200).json({ urls });
    } catch {
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}
