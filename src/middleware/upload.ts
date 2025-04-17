import multer from "multer";

export const upload = multer({
    storage: multer.memoryStorage(), // No disk, just RAM
    limits: { fileSize: 20 * 1024 * 1024 }, // optional: max 20MB
});


