// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import multer from "multer";
import { rateLimit } from "@/lib/rate-limit";

const uploadDir = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

type MulterFile = { originalname: string };
type MulterCallback = (error: Error | null, destination?: string) => void;
type MulterFilenameCallback = (error: Error | null, filename: string) => void;

const storage = multer.diskStorage({
  destination: (_req: NextApiRequest, _file: MulterFile, cb: MulterCallback) =>
    cb(null, uploadDir),
  filename: (_req: NextApiRequest, file: MulterFile, cb: MulterFilenameCallback) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "");
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base || "image"}-${unique}${ext}`);
  },
});

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

  upload.array("images", 4)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: "Upload failed" });
    }

    const files = (req as NextApiRequest & { files?: Express.Multer.File[] }).files ?? [];
    const urls = files.map((file) => `/uploads/${file.filename}`);
    return res.status(200).json({ urls });
  });
}
