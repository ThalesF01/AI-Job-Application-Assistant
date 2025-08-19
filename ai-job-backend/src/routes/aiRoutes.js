// src/routes/aiRoutes.js
const express = require("express");
const axios = require("axios");
const { generateResumeSummary }  = require("../services/aiService.js");

const router = express.Router();

router.post("/summary", async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || !String(resumeText).trim()) {
      return res.status(400).json({ error: "resumeText é obrigatório" });
    }

    // 1) tentar aiService (Groq) se disponível
    if (process.env.GROQ_API_KEY) {
      try {
        const summary = await generateResumeSummary(resumeText);
        return res.json({ summary });
      } catch (err) {
        console.warn("[aiRoutes] erro usando Groq aiService:", err?.message || err);
      }
    }
  } catch (err) {
    console.error("[aiRoutes] erro inesperado:", err);
    return res.status(500).json({ error: "Erro interno ao gerar resumo", details: err?.message ?? String(err) });
  }
});

module.exports = router;