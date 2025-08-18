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
  optimizedResumeMarkdown: string | null;
  originalScore?: number | null;
  optimizedScore?: number | null;
  strengths?: string[];
  gaps?: string[];
  behavioralAnalysis?: string | null;
};

export type CoverLetterResponse = {
  coverLetterMarkdown: string | null;
};

export type NewResumeResponse = {
  newResume: string | null;
  changes?: {
    added?: string[];
    removed?: string[];
    reorganized?: string[];
  };
  explanation?: string | null;
};

export type InterviewQuestion = {
  question: string;
  answer: string;
};

export type InterviewSimulationResponse = {
  qa: InterviewQuestion[];
  interviewerQuestions: string[];
};

export type UploadResponse = {
  resume_id: string;
  parsed?: ParsedResume;
  extractedText?: string | null;
  summary?: string | null;
};
