// src/routes/jobApplications.js
const express = require("express");
const multer = require("multer");
const createApplication = require("../controllers/applicationsController.js").createApplication;
const generateOptimizedResume = require("../controllers/applicationsController.js").generateOptimizedResume;
const generateCoverLetter = require("../controllers/applicationsController.js").generateCoverLetter;
const generateInterviewSimulation = require("../controllers/applicationsController.js").generateInterviewSimulation;
const generateNewResume = require("../controllers/applicationsController.js").generateNewResume;

const router = express.Router();
const upload = multer(); // memory storage

// upload e processamento do currículo
router.post("/upload", upload.single("resume"), createApplication);

// rota para gerar currículo otimizado (body: { resumeText, resume_id? })
router.post("/generate/new-resume", express.json(), generateNewResume);

// rota para gerar currículo otimizado baseado em descrição de vaga (body: { resumeText, jobDescription, resume_id? })
router.post("/generate/resume", express.json(), generateOptimizedResume);

// rota para gerar carta apresentação (body: { resumeText, jobDescription, resume_id? })
router.post("/generate/cover-letter", express.json(), generateCoverLetter);

// rota para simulação de entrevista (body: { resumeText, jobDescription })
router.post("/generate/interview", express.json(), generateInterviewSimulation);

module.exports = router;