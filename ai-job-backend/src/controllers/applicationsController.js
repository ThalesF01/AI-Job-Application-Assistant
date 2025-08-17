// src/controllers/applicationsController.js
import fs from "fs";
import path from "path";
import axios from "axios";
import { uploadFile } from "../services/s3Service.js";
import { saveApplication } from "../services/dynamoService.js";
import { generateOptimizedResume as aiGenerateOptimizedResume,  generateCoverLetter as aiGenerateCoverLetter, simulateInterview as aiSimulateInterview  } from "../services/aiService.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

async function extractTextFromBuffer(buffer, originalName) {
  const lower = (originalName || "").toLowerCase();
  let pdfParse = null;
  let mammoth = null;

  try {
    if (lower.endsWith(".pdf")) {
      const mod = await import("pdf-parse").catch((e) => {
        console.warn("import pdf-parse failed:", e?.message || e);
        return null;
      });
      pdfParse = mod ? (mod.default ?? mod) : null;
    }
    if (lower.endsWith(".docx")) {
      const mod = await import("mammoth").catch((e) => {
        console.warn("import mammoth failed:", e?.message || e);
        return null;
      });
      mammoth = mod ? (mod.default ?? mod) : null;
    }
  } catch (impErr) {
    console.warn("[extractTextFromBuffer] erro no import dinâmico:", impErr?.message || impErr);
  }

  try {
    let text = "";

    if (lower.endsWith(".pdf") && pdfParse) {
      const data = await pdfParse(buffer);
      text = data?.text ?? "";
    } else if (lower.endsWith(".docx") && mammoth) {
      const res = await mammoth.extractRawText({ buffer });
      text = res?.value ?? "";
    } else {
      text = buffer.toString("utf8");
    }

    text = (text || "").trim();

    // segurança: detecção rápida de binário/scan para evitar devolver lixo
    const head = text.slice(0, 64);
    const nonPrintableRatio =
      text.length === 0
        ? 0
        : text.split("").filter((ch) => ch.charCodeAt(0) < 32 && ch !== "\n" && ch !== "\r" && ch !== "\t").length / text.length;

    if (head.startsWith("%PDF") || nonPrintableRatio > 0.15) {
      console.warn("[extractTextFromBuffer] conteúdo parece binário; extração inválida, abortando texto extraído.");
      return "";
    }

    return text;
  } catch (err) {
    console.warn("[extractTextFromBuffer] erro ao extrair texto (fallback para utf8):", err?.message || err);
    try {
      const text = buffer.toString("utf8").trim();
      if (text.startsWith("%PDF")) return "";
      const nonPrintableRatio =
        text.length === 0 ? 0 : text.split("").filter((ch) => ch.charCodeAt(0) < 32 && ch !== "\n" && ch !== "\r" && ch !== "\t").length / text.length;
      if (nonPrintableRatio > 0.15) return "";
      return text;
    } catch (e) {
      return "";
    }
  }
}

export const createApplication = async (req, res) => {
  let localPath = null;
  try {
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado." });

    const allowed = [".pdf", ".docx", ".doc", ".txt"];
    const originalName = req.file.originalname || "resume";
    const ext = path.extname(originalName).toLowerCase();
    if (!allowed.includes(ext)) {
      return res.status(400).json({ error: `Tipo de arquivo não suportado (${ext}). Use PDF/DOCX/TXT.` });
    }

    const id = Date.now().toString();
    const key = `${id}_${originalName.replace(/\s+/g, "_")}`;
    localPath = path.join(uploadsDir, key);

    try {
      fs.writeFileSync(localPath, req.file.buffer);
    } catch (wErr) {
      console.warn("[createApplication] falha ao salvar local (seguindo sem salvar):", wErr?.message || wErr);
      localPath = null;
    }

    // upload para S3
    const s3Res = await uploadFile(req.file.buffer, key, req.file.mimetype);

    const application = {
      id,
      resumeUrl: s3Res?.Location ?? null,
      originalName,
      createdAt: new Date().toISOString(),
    };
    await saveApplication(application);

    // extrair texto (pode ser vazio)
    const resumeText = await extractTextFromBuffer(req.file.buffer, originalName);
    const extractedText = resumeText ? (resumeText.length > 10000 ? resumeText.slice(0, 10000) : resumeText) : "";

    // chamar IA (FastAPI por padrão) — timeout longo para evitar falha em modelos pesados
    let summary = null;
    if (resumeText && resumeText.length > 50) {
      try {
        const aiRes = await axios.post(`${AI_SERVICE_URL}/summarize`, { resumeText }, { timeout: 120000 });
        summary = aiRes?.data?.summary ?? null;
      } catch (aiErr) {
        console.warn("[createApplication] erro ao chamar IA (não falha upload):", aiErr?.message || aiErr);
        summary = null;
      }
    } else {
      console.warn("[createApplication] sem texto extraído; pulando chamada à IA.");
    }

    // devolve JSON compatível com frontend
    return res.status(201).json({
      message: "Aplicação salva",
      resume_id: id,
      application,
      parsed: { skills: [] }, // placeholder (você disse que não registra name/email por enquanto)
      extractedText,
      summary,
    });
  } catch (err) {
    console.error("[createApplication] erro inesperado:", err);
    return res.status(500).json({ error: "Erro interno no servidor", details: err?.message ?? String(err) });
  } finally {
    try {
      if (localPath && fs.existsSync(localPath)) fs.unlinkSync(localPath);
    } catch (cleanupErr) {
      console.warn("[createApplication] falha ao remover arquivo local:", cleanupErr?.message || cleanupErr);
    }
  }
};

// Novo handler: gerar currículo otimizado (chamado pela rota)
export const generateOptimizedResume = async (req, res) => {
  try {
    const { resumeText, resume_id, jobDescription } = req.body;

    if (!jobDescription || !String(jobDescription).trim()) {
      return res.status(400).json({ error: "jobDescription é obrigatório." });
    }

    // PRIORIDADE: use resumeText enviado pelo frontend.
    let textToUse = resumeText && String(resumeText).trim() ? String(resumeText).trim() : null;

    // Se não veio resumeText, você pode tentar buscar do Dynamo/S3 usando resume_id.
    // Por simplicidade aqui retornamos erro para que front envie extractedText (recomendado).
    if (!textToUse) {
      return res.status(400).json({ error: "resumeText ausente. Envie o texto extraído do currículo (campo 'resumeText')." });
    }

    // Chama aiService (Groq)
    let optimized = null;
    try {
      optimized = await aiGenerateOptimizedResume(textToUse, jobDescription);
    } catch (aiErr) {
      console.error("[generateOptimizedResume] erro aiService:", aiErr?.message || aiErr);
      optimized = null;
    }

    return res.json({ optimizedResumeMarkdown: optimized });
  } catch (err) {
    console.error("[generateOptimizedResume] erro:", err);
    return res.status(500).json({ error: "Erro ao gerar currículo otimizado", details: err?.message ?? String(err) });
  }
};

// Novo handler: gerar carta de apresentação (chamado pela rota)
export const generateCoverLetter = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!jobDescription || !String(jobDescription).trim()) {
      return res.status(400).json({ error: "jobDescription é obrigatório." });
    }

    if (!resumeText || !String(resumeText).trim()) {
      return res.status(400).json({ error: "resumeText é obrigatório para gerar a carta." });
    }

    let coverLetter = null;
    try {
      coverLetter = await aiGenerateCoverLetter(resumeText, jobDescription);
    } catch (aiErr) {
      console.error("[generateCoverLetter] erro aiService:", aiErr?.message || aiErr);
      coverLetter = null;
    }

    return res.json({ coverLetterMarkdown: coverLetter });
  } catch (err) {
    console.error("[generateCoverLetter] erro:", err);
    return res.status(500).json({ error: "Erro ao gerar carta de apresentação", details: err?.message ?? String(err) });
  }
};

// Novo handler: simulação de entrevista (chamado pela rota)
export const generateInterviewSimulation = async (req, res) => {
  try {
    const { resumeText, resume_id, jobDescription } = req.body;

    if (!jobDescription || !String(jobDescription).trim()) {
      return res.status(400).json({ error: "jobDescription é obrigatório." });
    }

    // Prioriza resumeText enviado pelo front (recomendado)
    const textToUse = resumeText && String(resumeText).trim() ? String(resumeText).trim() : null;
    if (!textToUse) {
      return res.status(400).json({ error: "resumeText ausente. Envie o texto extraído do currículo (campo 'resumeText')." });
    }

    let qa = [];
    try {
      const result = await aiSimulateInterview(textToUse, jobDescription);
      // result deve ser um array [{ question, answer }, ...]
      if (Array.isArray(result) && result.length > 0) {
        qa = result.map((it) => ({
          question: it.question ?? it.pergunta ?? "",
          answer: it.answer ?? it.resposta ?? ""
        })).filter(x => x.question && x.answer);
      }
    } catch (aiErr) {
      console.error("[generateInterviewSimulation] erro aiService:", aiErr?.message || aiErr);
      qa = [];
    }

    // sempre retornar objeto previsível
    return res.json({ qa });
  } catch (err) {
    console.error("[generateInterviewSimulation] erro:", err);
    return res.status(500).json({ error: "Erro ao simular entrevista", details: err?.message ?? String(err) });
  }
};