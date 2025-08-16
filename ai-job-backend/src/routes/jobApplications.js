// src/routes/jobApplications.js
import express from "express";
import multer from "multer";
import { createApplication } from "../controllers/applicationsController.js";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/upload", upload.single("resume"), createApplication);

// rota /parse removida por ora

export default router;
