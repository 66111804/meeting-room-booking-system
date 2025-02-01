import path from "node:path";
import multer, { Multer } from "multer";

export const uploadDir = path.join(__dirname, "../../uploads");

export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const uuid = Math.random().toString(36).substring(2, 15);
    const originalName = file.originalname.split('.').slice(0, -1).join('.').trim().replace(/\s+/g, "");
    cb(null, `${originalName}-${Date.now()}-${uuid}.${ext}`);
  }
});

export const upload: Multer = multer({storage,
  limits: {
    fileSize: 1024 * 1024 * 10 // 10MB
  }});