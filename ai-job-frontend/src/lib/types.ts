// src/lib/types.ts
export type ParsedResume = {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experiences?: Array<{ role: string; company?: string; period?: string; bullets?: string[] }>;
  education?: string[];
  rawText?: string;
};

export type OptimizeResumeResponse = {
  optimizedResumeMarkdown: string;
};

export type CoverLetterResponse = {
  coverLetterMarkdown: string;
};

export type InterviewSimResponse = {
  qa: Array<{ question: string; answer: string }>;
};

export type MatchResponse = {
  score: number; // 0..1
  topKeywords?: string[];
};

/**
 * UploadResponse — o backend retorna isso ao enviar currículo
 * - resume_id: id gerado
 * - parsed: objeto com parsed resume (pode ser vazio/placeholder)
 * - extractedText: texto extraído do PDF/DOCX (pode ser string vazia)
 * - summary: resumo gerado (ou null)
 */
export type UploadResponse = {
  resume_id: string;
  parsed?: ParsedResume;
  extractedText?: string | null;
  summary?: string | null;
};
