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

export type UploadResponse = {
  resume_id: string;
  parsed?: ParsedResume;
  extractedText?: string; // <-- novo
  summary?: string | null;
};
