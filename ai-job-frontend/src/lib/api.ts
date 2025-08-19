// src/lib/api.ts
import type {
  OptimizeResumeResponse,
  CoverLetterResponse,
  NewResumeResponse,
  UploadResponse,
} from "./types";

/* config */
const BACKEND_URL = "URL https://ai-job-application-assistant.onrender.com";

export async function uploadResume(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("resume", file);
  const url = `${BACKEND_URL}/api/applications/upload`;
  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) {
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
}

export async function generateResumeSummaryAPI(resumeText: string): Promise<{ summary: string | null }> {
  const url = `${BACKEND_URL}/api/ai/summary`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText }),
  });
  if (!res.ok) {
    let details: unknown;
    try {
      details = await res.json();
    } catch {
      details = await res.text();
    }
    throw new Error(`Falha ao gerar resumo: ${res.status} - ${JSON.stringify(details)}`);
  }
  return await res.json();
}

export async function generateNewResume(
  resumeId: string,
  resumeText?: string
): Promise<NewResumeResponse> {
  const url = `${BACKEND_URL}/api/applications/generate/new-resume`;
  const body: Record<string, unknown> = {};
  if (resumeId) body.resume_id = resumeId;
  if (resumeText) body.resumeText = resumeText;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(`Erro na geração de currículo (novo): ${res.status} - ${details}`);
  }

  const json = await res.json();
  return {
    newResume: json.newResume ?? null,
    changes: {
      added: Array.isArray(json.changes?.added) ? json.changes.added : Array.isArray(json.added) ? json.added : [],
      removed: Array.isArray(json.changes?.removed) ? json.changes.removed : Array.isArray(json.removed) ? json.removed : [],
      reorganized: Array.isArray(json.changes?.reorganized) ? json.changes.reorganized : Array.isArray(json.reorganized) ? json.reorganized : [],
    },
    explanation: json.explanation ?? null,
  };
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
    throw new Error(`Erro na geração de currículo (otimizado): ${res.status} - ${details}`);
  }

  const json = await res.json();
  return {
    optimizedResumeMarkdown: json.optimizedResumeMarkdown ?? null,
    originalScore: typeof json.originalScore === "number" ? json.originalScore : null,
    optimizedScore: typeof json.optimizedScore === "number" ? json.optimizedScore : null,
    strengths: Array.isArray(json.strengths) ? json.strengths : [],
    gaps: Array.isArray(json.gaps) ? json.gaps : [],
    behavioralAnalysis: json.behavioralAnalysis ?? null,
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
  return { coverLetterMarkdown: json.coverLetterMarkdown ?? null };
}

export async function simulateInterview(
  resumeId: string | null,
  jobDescription: string,
  resumeText?: string
): Promise<{
  qa: { question: string; answer: string }[];
  interviewerQuestions: string[];
}> {
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
  console.log("[simulateInterview] resposta da API:", json);

  // fallback para perguntas do entrevistador
  let interviewerQuestions: string[] = [];
  if (Array.isArray(json.interviewerQuestions)) {
    interviewerQuestions = json.interviewerQuestions;
  } else if (Array.isArray(json.questionsForRecruiter)) {
    interviewerQuestions = json.questionsForRecruiter;
  } else if (Array.isArray(json.perguntasParaEntrevistador)) {
    interviewerQuestions = json.perguntasParaEntrevistador;
  }

  return {
    qa: Array.isArray(json.qa) ? json.qa : [],
    interviewerQuestions,
  };
}