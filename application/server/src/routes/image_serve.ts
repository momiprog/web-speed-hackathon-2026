import { promises as fs } from "fs";
import path from "path";
import { Router } from "express";
import sharp from "sharp";
import { PUBLIC_PATH, UPLOAD_PATH } from "@web-speed-hackathon-2026/server/src/paths";

export const imageServeRouter = Router();

const serveResizedImage = async (req: any, res: any, subDir: string = "") => {
  const { filename } = req.params;
  const widthStr = req.query.width as string | undefined;
  const width = widthStr ? parseInt(widthStr, 10) : null;
  
  // 検索対象のパス候補
  const paths = [
    path.resolve(UPLOAD_PATH, "images", subDir, filename),
    path.resolve(PUBLIC_PATH, "images", subDir, filename),
  ];

  let imagePath = "";
  for (const p of paths) {
    try {
      await fs.access(p);
      imagePath = p;
      break;
    } catch {
      continue;
    }
  }

  if (!imagePath) {
    return res.status(404).send("Not Found");
  }

  try {
    const sharpInstance = sharp(imagePath);
    
    if (width && !isNaN(width)) {
      sharpInstance.resize(width);
    }
    
    // 品質を下げて AVIF に変換
    const buffer = await sharpInstance
      .avif({ quality: 50 })
      .toBuffer();
    
    return res
      .status(200)
      .type("image/avif")
      .set("Cache-Control", "public, max-age=31536000, immutable")
      .send(buffer);
  } catch (error) {
    console.error("Image processing error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// /images/:filename (例: /images/abc.avif)
imageServeRouter.get("/:filename", (req, res) => serveResizedImage(req, res));

// /images/profiles/:filename (例: /images/profiles/user1.avif)
imageServeRouter.get("/profiles/:filename", (req, res) => serveResizedImage(req, res, "profiles"));
