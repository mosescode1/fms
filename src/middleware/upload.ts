import multer from "multer";

export const upload = multer({
    storage: multer.memoryStorage(), // No disk, just RAM
    // limits: { fileSize: 1000 * 1024 * 1024 }, // optional: max 100MB
});


