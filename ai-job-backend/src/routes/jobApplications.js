// src/routes/jobApplications.js
import express from "express";
import multer from "multer";
import { createApplication } from "../controllers/applicationsController.js";

const router = express.Router();
const upload = multer(); // memory storage

// upload e processamento do currículo
router.post("/upload", upload.single("resume"), createApplication);

// rota /parse removida por enquanto (você já comentou que não precisa)

export default router;
