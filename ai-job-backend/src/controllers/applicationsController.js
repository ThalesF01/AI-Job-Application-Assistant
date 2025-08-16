// src/controllers/applicationsController.js
import fs from "fs";
import path from "path";
import axios from "axios";
import { uploadFile } from "../services/s3Service.js";
import { saveApplication } from "../services/dynamoService.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

async function extractTextFromBuffer(buffer, originalName) {
  const lower = (originalName || "").toLowerCase();
  let pdfParse = null;
  let mammoth = null;

  try {
    if (lower.endsWith(".pdf")) {
      const mod = await import("pdf-parse").catch(() => null);
      pdfParse = mod ? (mod.default ?? mod) : null;
    }
    if (lower.endsWith(".docx")) {
      const mod = await import("mammoth").catch(() => null);
      mammoth = mod ? (mod.default ?? mod) : null;
    }
  } catch {
    // silent
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

    // rejeita conteúdo binário bruto
    const head = text.slice(0, 64);
    const nonPrintable = text.split('').filter(ch => ch.charCodeAt(0) < 32 && ch !== '\n' && ch !== '\r' && ch !== '\t').length;
    const nonPrintableRatio = text.length ? nonPrintable / text.length : 0;
    if (head.startsWith("%PDF") || nonPrintableRatio > 0.15) {
      return "";
    }

    return text;
  } catch {
    try {
      const fallback = buffer.toString("utf8").trim();
      if (fallback.startsWith("%PDF")) return "";
      const nonPrintable = fallback.split('').filter(ch => ch.charCodeAt(0) < 32 && ch !== '\n' && ch !== '\r' && ch !== '\t').length;
      const nonPrintableRatio = fallback.length ? nonPrintable / fallback.length : 0;
      if (nonPrintableRatio > 0.15) return "";
      return fallback;
    } catch {
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

    try { fs.writeFileSync(localPath, req.file.buffer); } catch {}
    const s3Res = await uploadFile(req.file.buffer, key, req.file.mimetype);

    const application = {
      id,
      resumeUrl: s3Res?.Location ?? null,
      originalName,
      createdAt: new Date().toISOString(),
    };
    await saveApplication(application);

    // extrair texto
    const resumeText = await extractTextFromBuffer(req.file.buffer, originalName);

    // limitar tamanho enviado ao frontend (evitar payload imenso)
    const extractedText = resumeText ? (resumeText.length > 10000 ? resumeText.slice(0, 10000) : resumeText) : "";

    // chamar IA se houver texto suficiente
    let summary = null;
    if (resumeText && resumeText.length > 50) {
      try {
        const aiRes = await axios.post(`${AI_SERVICE_URL}/summarize`, { resumeText }, { timeout: 120000 });
        summary = aiRes?.data?.summary ?? null;
      } catch (aiErr) {
        console.error("[createApplication] erro ao chamar IA:", aiErr?.message ?? aiErr);
        summary = null;
      }
    }

    return res.status(201).json({
      message: "Aplicação salva",
      resume_id: id,
      application,
      parsed: { skills: [] }, // placeholder
      extractedText, // texto extraído (pode estar vazio)
      summary, // pode ser null
    });
  } catch (err) {
    console.error("[createApplication] erro inesperado:", err);
    return res.status(500).json({ error: "Erro interno no servidor", details: err?.message ?? String(err) });
  } finally {
    try { if (localPath && fs.existsSync(localPath)) fs.unlinkSync(localPath); } catch {}
  }
};
