// src/lib/api.ts
import type {
  ParsedResume,
  OptimizeResumeResponse,
  CoverLetterResponse,
  InterviewSimulationResponse,
  UploadResponse,
  } from "./types";

/**
 * Config
 */
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL; // opcional
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"; // Node backend
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000"; // FastAPI (fallback)
const MOCK = process.env.NEXT_PUBLIC_MOCK === "1";

// Base que será usada para chamadas "API" (por padrão aponta para /api/applications no backend)
const API_BASE = BASE ?? `${BACKEND_URL}/api/applications`;

console.log("API_BASE:", API_BASE);
console.log("BACKEND_URL:", BACKEND_URL);
console.log("AI_URL (dev/fallback):", AI_URL);
console.log("MOCK:", MOCK);

/**
 * safeFetch — faz fetch para API_BASE + url
 * devolve mock se MOCK ativado
 */
async function safeFetch<T>(url: string, init?: RequestInit, mock?: T): Promise<T> {
  try {
    const full = `${API_BASE}${url}`;
    const res = await fetch(full, init);
    if (!res.ok) {
      // tenta ler JSON, senão texto
      let details: unknown;
      try {
        details = await res.json();
      } catch {
        details = await res.text();
      }
      throw new Error(`HTTP ${res.status} - ${JSON.stringify(details)}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (MOCK && mock) return mock;
    throw err;
  }
}

/**
 * Upload de currículo
 * - envia para BACKEND_URL/api/applications/upload
 * - retorna resume_id, parsed, extractedText e summary (se backend retornar)
 */
export async function uploadResume(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("resume", file);

  const url = `${BACKEND_URL}/api/applications/upload`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      // tenta ler json, se não der lê texto
      let details: unknown;
      try {
        details = await res.json();
      } catch {
        details = await res.text();
      }
      throw new Error(`Upload falhou: ${res.status} ${JSON.stringify(details)}`);
    }

    const json = (await res.json()) as UploadResponse;
    return json;
  } catch (err) {
    console.error("[uploadResume] erro:", err);
    throw err;
  }
}

/**
 * Parse do currículo (se você ainda tiver essa rota no backend)
 * - POST /parse/:id
 * - Retorna { parsed: ParsedResume }
 */
export async function parseResume(resumeId: string): Promise<{ parsed: ParsedResume }> {
  return safeFetch<{ parsed: ParsedResume }>(`/parse/${resumeId}`, { method: "POST" }, {
    parsed: {
      name: "Thales Fiscus",
      email: "mock@email.com",
      skills: ["Python", "TensorFlow", "PyTorch"]
    }
  });
}

/**
 * Geração de resumo IA (via Node backend)
 *
 * - POST ${BACKEND_URL}/api/ai/summary
 * - body: { resumeText }
 * - retorna: { summary: string | null }
 */
export async function generateResumeSummaryAPI(resumeText: string): Promise<{ summary: string | null }> {
  const url = `${BACKEND_URL}/api/ai/summary`; // chama o Node (sem CORS do browser)
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText }),
    });

    if (!res.ok) {
      // detalhar erro para facilitar debug
      let details: unknown;
      try {
        details = await res.json();
      } catch {
        details = await res.text();
      }
      throw new Error(`Falha ao gerar resumo: ${res.status} - ${JSON.stringify(details)}`);
    }

    const json = await res.json();
    // json: { summary: string | null } ou { error: ... }
    return json;
  } catch (err) {
    console.error("[generateResumeSummaryAPI] erro:", err);
    throw err;
  }
}

export async function generateOptimizedResume(
  resumeId: string,
  jobDescription: string,
  resumeText?: string
): Promise<OptimizeResumeResponse> {
  const url = `${BACKEND_URL}/api/applications/generate/resume`;

  const body: Record<string, unknown> = { jobDescription };
  if (resumeId) body.resume_id = resumeId;
  if (resumeText) body.resumeText = resumeText;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(`Erro ao gerar currículo otimizado: ${res.status} - ${details}`);
  }

  const json = await res.json();
  // json.optimizedResumeMarkdown (pode ser null)
  return {
    optimizedResumeMarkdown: json.optimizedResumeMarkdown ?? "",
  };
}

export async function generateCoverLetter(
  resumeId: string,
  jobDescription: string,
  resumeText?: string
): Promise<CoverLetterResponse> {
  const url = `${BACKEND_URL}/api/applications/generate/cover-letter`;

  const body: Record<string, unknown> = { jobDescription };
  if (resumeId) body.resume_id = resumeId;
  if (resumeText) body.resumeText = resumeText;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(`Erro ao gerar carta de apresentação: ${res.status} - ${details}`);
  }

  const json = await res.json();
  // json.coverLetterMarkdown (pode ser null)
  return {
    coverLetterMarkdown: json.coverLetterMarkdown ?? "",
  };
}

// aiClient.ts ou service.ts (onde você fez generateCoverLetter)
export async function simulateInterview(
  resumeId: string,
  jobDescription: string,
  resumeText?: string
): Promise<{ qa: Array<{ question: string; answer: string }> }> {
  const url = `${BACKEND_URL}/api/applications/generate/interview`;

  const body: Record<string, unknown> = { jobDescription };
  if (resumeId) body.resume_id = resumeId;
  if (resumeText) body.resumeText = resumeText;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(`Erro ao gerar simulação de entrevista: ${res.status} - ${details}`);
  }

  const json = await res.json();
  return { qa: json.qa ?? [] };
}
