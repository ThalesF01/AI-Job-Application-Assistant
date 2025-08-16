// src/lib/api.ts
import type {
  ParsedResume,
  OptimizeResumeResponse,
  CoverLetterResponse,
  InterviewSimResponse,
  MatchResponse,
  UploadResponse
} from "./types";

/**
 * Config
 */
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL; // (opcional) ex: http://localhost:5000/api/applications
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"; // ex: http://localhost:5000
const MOCK = process.env.NEXT_PUBLIC_MOCK === "1";

// Base que será usada para chamadas "API" (por padrão aponta para /api/applications no backend)
const API_BASE = BASE ?? `${BACKEND_URL}/api/applications`;

console.log("API_BASE:", API_BASE);
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
 * Tipagem do retorno do upload
 */


/**
 * Upload de currículo
 * - envia para BACKEND_URL/api/applications/upload
 * - retorna resume_id, parsed e summary (se backend retornar)
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
 * Score de aderência
 */
export async function matchJob(resumeId: string, jobDescription: string): Promise<MatchResponse> {
  return safeFetch<MatchResponse>(
    "/match",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_id: resumeId, job_description: jobDescription }),
    },
    { score: 0.82, topKeywords: ["RAG", "LLM", "AWS", "TensorFlow"] }
  );
}

/**
 * Currículo otimizado
 */
export async function generateOptimizedResume(
  resumeId: string,
  jobDescription: string
): Promise<OptimizeResumeResponse> {
  return safeFetch<OptimizeResumeResponse>(
    "/generate/resume",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_id: resumeId, job_description: jobDescription }),
    },
    {
      optimizedResumeMarkdown: `## Resumo Profissional\n- Analista de Sistemas focado em IA...`
    }
  );
}

/**
 * Carta de apresentação
 */
export async function generateCoverLetter(
  resumeId: string,
  jobDescription: string
): Promise<CoverLetterResponse> {
  return safeFetch<CoverLetterResponse>(
    "/generate/cover",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_id: resumeId, job_description: jobDescription }),
    },
    {
      coverLetterMarkdown: `Prezados,\n\nTenho experiência prática em IA aplicada...`
    }
  );
}

/**
 * Simulação de entrevista
 */
export async function simulateInterview(
  resumeId: string,
  jobDescription: string
): Promise<InterviewSimResponse> {
  return safeFetch<InterviewSimResponse>(
    "/simulate/interview",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_id: resumeId, job_description: jobDescription }),
    },
    {
      qa: [
        { question: "Explique RAG em poucas linhas.", answer: "RAG combina recuperação de contexto..." },
        { question: "Como você faria deploy na AWS?", answer: "ECS Fargate, S3 para assets, RDS para dados..." },
      ],
    }
  );
}
