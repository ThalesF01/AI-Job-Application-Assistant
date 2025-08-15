import multer from "multer";

const storage = multer.memoryStorage(); // arquivo em memória
export const upload = multer({ storage });
