import type {
  ParsedResume,
  OptimizeResumeResponse,
  CoverLetterResponse,
  InterviewSimResponse,
  MatchResponse,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const MOCK = process.env.NEXT_PUBLIC_MOCK === "1";

console.log("BASE_URL:", BASE);
console.log("MOCK:", MOCK);

async function safeFetch<T>(url: string, init?: RequestInit, mock?: T): Promise<T> {
  try {
    if (!BASE) throw new Error("BASE_URL not set");
    const res = await fetch(`${BASE}${url}`, init);
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as T;
  } catch (err) {
    if (MOCK && mock) return mock;
    throw err;
  }
}

// Upload de currículo
export async function uploadResume(file: File): Promise<{ resume_id: string }> {
  const form = new FormData();
  form.append("resume", file);
  return safeFetch<{ resume_id: string }>("/upload", { method: "POST", body: form });
}

// Parse do currículo
export async function parseResume(resumeId: string): Promise<{ parsed: ParsedResume }> {
  return safeFetch<{ parsed: ParsedResume }>(
    `/parse/${resumeId}`,
    { method: "POST" },
    {
      parsed: {
        name: "Thales Fiscus",
        email: "thalesgabriel07@email.com",
        skills: ["Python", "TensorFlow", "PyTorch", "LangChain", "AWS", "Vue.js"],
        experiences: [
          {
            role: "Analista de Sistemas",
            company: "Mastercoin",
            period: "2023-Atual",
            bullets: ["Automação com IA", "Integrações com APIs", "Manutenção evolutiva"],
          }
        ],
        education: ["ADS - UniCarioca"],
        rawText: "Currículo de exemplo para mock."
      }
    }
  );
}

// Score de aderência à vaga
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

// Currículo otimizado
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
      optimizedResumeMarkdown: `## Resumo Profissional
- Analista de Sistemas focado em IA, RAG e LLMs na AWS.
- Resultados: +40% produtividade em automações internas.

## Experiências Relevantes
- **Analista de Sistemas | 2023-Atual**
  - Implementação de RAG com LangChain e embeddings.
  - Deploy em AWS (S3, EC2, RDS).

## Skills
Python • TensorFlow • PyTorch • Scikit-learn • LangChain • AWS • Vue.js • React
`,
    }
  );
}

// Carta de apresentação
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
      coverLetterMarkdown: `Prezados,

Tenho experiência prática em IA aplicada (RAG, LLMs e deploy na AWS) e acredito que posso contribuir diretamente para ${"sua empresa"}...
Atenciosamente,
Thales Fiscus`,
    }
  );
}

// Simulação de entrevista
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
