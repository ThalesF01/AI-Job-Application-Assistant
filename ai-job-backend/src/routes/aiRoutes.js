// src/routes/aiRoutes.js
import express from "express";
import axios from "axios";
import { generateResumeSummary } from "../services/aiService.js";

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/ai/summary
 * body: { resumeText: string }
 *
 * Flow:
 *  - se GROQ (aiService) estiver configurado, tenta usar;
 *  - senão faz proxy para FastAPI (AI_SERVICE_URL /summarize).
 *  - retorna { summary: string | null } (200) mesmo quando resumo for null.
 */
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
        // não retorna erro; tenta fallback abaixo
      }
    }

    // 2) fallback: proxy para FastAPI (ou outra IA) hospedada em AI_SERVICE_URL
    try {
      const aiRes = await axios.post(`${AI_SERVICE_URL}/summarize`, { resumeText }, { timeout: 120000 });
      const summary = aiRes?.data?.summary ?? null;
      return res.json({ summary });
    } catch (err) {
      console.warn("[aiRoutes] fallback FastAPI falhou:", err?.message || err);
      return res.status(502).json({ error: "IA indisponível (Groq e FastAPI falharam)", details: err?.message ?? String(err) });
    }
  } catch (err) {
    console.error("[aiRoutes] erro inesperado:", err);
    return res.status(500).json({ error: "Erro interno ao gerar resumo", details: err?.message ?? String(err) });
  }
});

export default router;
