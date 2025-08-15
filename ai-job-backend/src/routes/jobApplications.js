// src/routes/jobApplications.js
import express from "express";
import multer from "multer";
import { createApplication, parseApplication } from "../controllers/applicationsController.js";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/upload", upload.single("resume"), createApplication);
router.post("/parse/:id", parseApplication);

export default router;
