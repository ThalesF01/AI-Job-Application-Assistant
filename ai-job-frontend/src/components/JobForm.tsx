// src/components/JobForm.tsx
"use client";

import { useState } from "react";
import {
  uploadResume,
  generateResumeSummaryAPI,
  generateOptimizedResume,
  generateCoverLetter,
  simulateInterview,
  generateNewResume,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ResultBlock from "./ResultBlock";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, Sparkles, FileText, MessageSquare, } from "lucide-react";

export default function JobForm() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeId, setResumeId] = useState<string>("");
  const [jobDesc, setJobDesc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [parsedPreview, setParsedPreview] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [resumeSummary, setResumeSummary] = useState<string>("");

  // otimização / análise IA
  const [newResumeMD, setNewResumeMD] = useState<string>("");
  const [newResumeChanges, setNewResumeChanges] = useState<{ added: string[]; removed: string[]; reorganized: string[] }>({ added: [], removed: [], reorganized: [] });
  const [newResumeExplanation, setNewResumeExplanation] = useState<string | null>(null);
  const [optimizedResumeMD, setOptimizedResumeMD] = useState<string>("");
  const [originalScore, setOriginalScore] = useState<number | null>(null);
  const [optimizedScore, setOptimizedScore] = useState<number | null>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);
  const [behavioralAnalysis, setBehavioralAnalysis] = useState<string | null>(null);

  const [coverLetterMD, setCoverLetterMD] = useState<string>("");
  const [interviewQA, setInterviewQA] = useState<Array<{ question: string; answer: string }>>([]);
  const [interviewerQuestions, setInterviewerQuestions] = useState<string[]>([]);


  async function handleUpload() {
    if (!file) return alert("Selecione um arquivo de currículo (PDF/DOCX).");
    setLoading(true);
    // reset parcial
    setParsedPreview("");
    setExtractedText("");
    setResumeSummary("");

    try {
      const { resume_id, parsed, extractedText: extText } = await uploadResume(file);
      setResumeId(resume_id);

      const preview = parsed?.skills?.length ? `**Skills:** ${parsed.skills.join(", ")}` : "Currículo processado.";
      setParsedPreview(preview);
      setExtractedText(extText || "");

      if (extText && extText.trim()) {
        try {
          const { summary } = await generateResumeSummaryAPI(extText);
          setResumeSummary(summary || "");
        } catch (err) {
          console.error("[JobForm] Falha ao gerar resumo via API:", err);
          setResumeSummary("");
        }
      }
    } catch (e: unknown) {
      console.error(e);
      alert("Falha no upload/parse/resumo. Veja o console.");
    } finally {
      setLoading(false);
    }
  }

  function renderPreviewContent() {
    return (
      <div>
        <div className="text-sm text-slate-100 mb-3" dangerouslySetInnerHTML={{ __html: parsedPreview.replace(/\n/g, "<br/>") }} />

        {extractedText ? (
  <div className="mb-3">
    <div className="text-xs text-slate-400 mb-1">Texto extraído (visualização):</div>
    <div className="max-h-72 overflow-auto p-3 bg-slate-900/30 rounded-md border border-slate-700">
      <pre className="whitespace-pre-wrap text-slate-200 leading-relaxed m-0">{extractedText}</pre>
    </div>
  </div>
) : (
  <div className="text-xs text-slate-400 mb-3">Nenhum texto legível extraído do arquivo.</div>
)}

        <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg shadow-sm">
  <div className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">
    Resumo (IA)
  </div>

  {resumeSummary ? (
    <div className="text-slate-100 space-y-2 leading-relaxed text-sm">
      {resumeSummary
        .split("\n")
        .map((line, idx) => (
          <p key={idx} className="indent-2">{line}</p>
        ))}
    </div>
  ) : (
    <div className="text-xs text-slate-400 italic">
      Resumo não disponível — talvez o arquivo seja uma imagem/scan ou a IA não respondeu.
    </div>
  )}
</div>

      </div>
    );
  }

  const handleNewResume = async () => {
  if (!resumeId) return alert("Envie e processe o currículo antes.");
  setLoading(true);

  // limpar estados antigos
  setNewResumeMD("");
  setNewResumeChanges({ added: [], removed: [], reorganized: [] });
  setNewResumeExplanation("");

  try {
    const result = await generateNewResume(resumeId, extractedText);

    setNewResumeMD(result.newResume ?? "");
    setNewResumeChanges({
      added: result.changes?.added || [],
      removed: result.changes?.removed || [],
      reorganized: result.changes?.reorganized || [],
    });
    setNewResumeExplanation(result.explanation ?? null);
  } catch (err) {
    console.error("Erro ao gerar novo currículo:", err);
    alert("Ocorreu um erro ao gerar o novo currículo.");
  } finally {
    setLoading(false);
  }
};

  async function handleOptimize() {
    if (!resumeId) return alert("Envie e processe o currículo antes.");
    if (!jobDesc.trim()) return alert("Cole a descrição da vaga.");
    setLoading(true);

    // limpar estados antigos
    setOptimizedResumeMD("");
    setOriginalScore(null);
    setOptimizedScore(null);
    setStrengths([]);
    setGaps([]);
    setBehavioralAnalysis(null);

    try {
      const opt = await generateOptimizedResume(resumeId, jobDesc, extractedText);

      // opt pode ser { optimizedResumeMarkdown, originalScore, optimizedScore, strengths, gaps, behavioralAnalysis }
      setOptimizedResumeMD(opt.optimizedResumeMarkdown ?? "");
      setOriginalScore(typeof opt.originalScore === "number" ? opt.originalScore : null);
      setOptimizedScore(typeof opt.optimizedScore === "number" ? opt.optimizedScore : null);
      setStrengths(Array.isArray(opt.strengths) ? opt.strengths : []);
      setGaps(Array.isArray(opt.gaps) ? opt.gaps : []);
      setBehavioralAnalysis(opt.behavioralAnalysis ?? null);
    } catch (e: unknown) {
      console.error(e);
      alert("Falha ao otimizar currículo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCover() {
    if (!resumeId) return alert("Envie e processe o currículo antes.");
    if (!jobDesc.trim()) return alert("Cole a descrição da vaga.");
    setLoading(true);
    try {
      const result = await generateCoverLetter(resumeId, jobDesc, extractedText);
      setCoverLetterMD(result.coverLetterMarkdown ?? "");
    } catch (e: unknown) {
      console.error(e);
      alert("Falha ao gerar carta de apresentação.");
    } finally {
      setLoading(false);
    }
  }

  async function handleInterview() {
  if (!resumeId) return alert("Envie e processe o currículo antes.");
  if (!jobDesc.trim()) return alert("Cole a descrição da vaga.");
  setLoading(true);

  type InterviewItem = { question: string; answer: string };

  const normalizeRawItem = (raw: unknown): InterviewItem => {
    if (!raw) return { question: "", answer: "" };
    if (typeof raw === "string") return { question: raw, answer: "" };
    if (typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      const q = obj.question ?? obj.pergunta ?? obj.q ?? "";
      const a = obj.answer ?? obj.resposta ?? obj.a ?? "";
      return { question: String(q), answer: String(a) };
    }
    return { question: String(raw), answer: "" };
  };

  const extractFromPossibleContainer = (container: unknown): InterviewItem[] => {
    if (Array.isArray(container)) return container.map(normalizeRawItem);
    if (typeof container === "object" && container !== null) {
      const obj = container as Record<string, unknown>;
      const keys = ["qa", "questionsAndAnswers", "questions_and_answers", "questions", "items", "data"];
      for (const key of keys) {
        const val = obj[key];
        if (Array.isArray(val)) return val.map(normalizeRawItem);
      }
      if ("question" in obj || "answer" in obj) return [normalizeRawItem(obj)];
    }
    return [];
  };

  try {
    const result = await simulateInterview(resumeId, jobDesc, extractedText);
    // ===== QA do entrevistado =====
    const qa: InterviewItem[] = Array.isArray(result.qa)
      ? result.qa.map(normalizeRawItem).filter((x) => x.question && x.answer)
      : extractFromPossibleContainer(result);
    setInterviewQA(qa);

    // ===== Perguntas para o entrevistador =====
    const interviewerQs: string[] =
      (Array.isArray(result.interviewerQuestions) && result.interviewerQuestions.map(String)) ||
      (Array.isArray(result.interviewerQuestions) && result.interviewerQuestions.map(String)) ||
      [];

    setInterviewerQuestions(interviewerQs);

  } catch (e: unknown) {
    console.error("[handleInterview] erro:", e);
    alert("Falha ao gerar simulação de entrevista.");
    setInterviewQA([]);
    setInterviewerQuestions([]);
  } finally {
    setLoading(false);
  }
}

  // helper visual para barras de score (0..100)
  const ScoreBar = ({ value }: { value: number | null }) => {
    const pct = value !== null && !Number.isNaN(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
    const ariaVal = value !== null && !Number.isNaN(value) ? Math.round(value) : undefined;
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-slate-400">{ariaVal !== undefined ? `${ariaVal}%` : "N/A"}</div>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={ariaVal}
          className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700"
        >
          <div style={{ width: `${pct}%` }} className="h-full bg-amber-500 transition-all duration-300" />
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-5 text-slate-100">
      {/* Upload + botão (alinhamento vertical corrigido) */}
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-2">
          <label className="text-sm text-slate-100">Currículo (PDF/DOCX)</label>

          <div className="relative h-[54px]">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
              aria-label="Selecionar currículo"
            />

            <div className="w-full h-full py-3 px-4 bg-slate-800/60 border border-slate-700 rounded-lg flex items-center justify-between gap-3 shadow-sm hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-slate-700/60 text-slate-200 text-lg">📁</span>

                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-100 truncate">
                    {file ? file.name : "Selecione um currículo"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {file ? `${(file.size / 1024).toFixed(1)} KB • ${file.type || file.name.split(".").pop()}` : "PDF ou DOCX • máximo X MB"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs text-slate-300">Arraste ou clique</span>
                <span className="inline-flex">
                  <span className="inline-flex items-center px-3 py-1 rounded bg-slate-700 text-xs text-slate-200">Selecionar</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
  onClick={handleUpload}
  disabled={loading || !file}
  className="h-[48px] flex items-center justify-center gap-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md shadow-indigo-800/40 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 md:ml-3"
>
  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
  <span className="font-medium">Enviar & Processar</span>
</Button>

      </div>

      {(parsedPreview || extractedText || resumeSummary) && (
        <ResultBlock title="Prévia do currículo" defaultCollapsed={false}>
          {renderPreviewContent()}
        </ResultBlock>
      )}

      <Separator className="bg-slate-700" />

      <ResultBlock title="Descrição da vaga" defaultCollapsed={false} className="mb-3">
        <div className="grid gap-2">
          <Textarea
            placeholder="Cole aqui a descrição da vaga..."
            rows={8}
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            className="bg-slate-800/60 text-slate-100 placeholder:text-slate-400 border border-slate-700"
          />
        </div>
      </ResultBlock>

      <div className="flex flex-wrap gap-3">
  {/* Otimização geral */}
  <Button
    onClick={handleNewResume}
    disabled={loading || !resumeId}
    className="flex items-center gap-2 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 hover:from-indigo-800 hover:via-indigo-700 hover:to-purple-800 text-white font-semibold px-5 py-3 rounded-lg shadow-md shadow-indigo-800/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
  >
    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
    Otimizar Currículo
  </Button>

  {/* Otimização baseada em vaga */}
  <Button
    onClick={handleOptimize}
    disabled={loading || !resumeId || !jobDesc.trim()}
    className="flex items-center gap-2 bg-gradient-to-r from-yellow-700 via-amber-600 to-orange-700 hover:from-yellow-800 hover:via-amber-700 hover:to-orange-800 text-white font-semibold px-5 py-3 rounded-lg shadow-md shadow-amber-800/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
  >
    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
    Otimizar com descrição de vaga
  </Button>

  {/* Gerar Carta */}
  <Button
    onClick={handleCover}
    disabled={loading || !resumeId || !jobDesc.trim()}
    className="flex items-center gap-2 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-700 hover:from-green-800 hover:via-emerald-700 hover:to-teal-800 text-white font-semibold px-5 py-3 rounded-lg shadow-md shadow-green-800/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
  >
    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
    Gerar Carta
  </Button>

  {/* Simular Entrevista */}
  <Button
    onClick={handleInterview}
    disabled={loading || !resumeId || !jobDesc.trim()}
    className="flex items-center gap-2 bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700 hover:from-cyan-800 hover:via-blue-700 hover:to-indigo-800 text-white font-semibold px-5 py-3 rounded-lg shadow-md shadow-blue-800/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
  >
    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
    Simular Entrevista
  </Button>
</div>







      {newResumeMD && (
  <ResultBlock title="Novo Currículo Otimizado" defaultCollapsed={true}>
    <div className="space-y-4">

      {/* Preview do novo currículo */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
            <span className="text-blue-400 text-xs font-bold">📄</span>
          </div>
          <div className="text-sm text-slate-300 font-medium">Novo currículo otimizado</div>
        </div>
        <div className="max-h-96 overflow-auto p-4 bg-slate-900/50 rounded-md border border-slate-700/30">
          <pre className="whitespace-pre-wrap text-slate-200 leading-relaxed m-0">{newResumeMD}</pre>
        </div>
      </div>

      {/* Alterações detalhadas */}
      <div className="grid md:grid-cols-3 gap-4">
        {["added", "removed", "reorganized"].map((type) => {
          const titleMap: Record<string, string> = {
            added: "Adicionado / Destacado",
            removed: "Removido / Simplificado",
            reorganized: "Reorganizado",
          };
          const items = newResumeChanges[type as keyof typeof newResumeChanges];
          return (
            <div key={type} className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-2 font-medium">{titleMap[type]}</div>
              {items.length > 0 ? (
                <ul className="list-disc pl-5 text-slate-100 space-y-1">
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-400">
                  {type === "added" && "Nenhum item adicionado sugerido."}
                  {type === "removed" && "Nenhuma remoção sugerida."}
                  {type === "reorganized" && "Nenhuma reorganização sugerida."}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explicação do porquê das mudanças */}
      {newResumeExplanation && (
        <div className="pt-2">
          <div className="text-xs text-slate-400 mb-1">Por que isso melhora seu currículo</div>
          <div className="text-slate-100 leading-relaxed bg-slate-900/40 p-3 rounded-md border border-slate-700/30">
            {newResumeExplanation}
          </div>
        </div>
      )}
    </div>
  </ResultBlock>
)}




      {optimizedResumeMD && (
  <ResultBlock title="Currículo Otimizado Baseado em vaga" defaultCollapsed={true}>
    <div className="space-y-4">
      {/* Scores */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-200 font-medium">Compatibilidade (original)</div>
          <div className="text-sm font-bold text-slate-200">{originalScore !== null ? `${Math.round(originalScore)}%` : "—"}</div>
        </div>
        <ScoreBar value={originalScore !== null ? Math.round(originalScore) : null} />

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-200 font-medium">Compatibilidade (otimizado)</div>
          <div className="text-sm font-bold text-emerald-400">{optimizedScore !== null ? `${Math.round(optimizedScore)}%` : "—"}</div>
        </div>
        <ScoreBar value={optimizedScore !== null ? Math.round(optimizedScore) : null} />
      </div>

      {/* currículo otimizado completo (preserva formatação) */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
            <span className="text-blue-400 text-xs font-bold">📄</span>
          </div>
          <div className="text-sm text-slate-300 font-medium">Currículo otimizado</div>
        </div>
        <div className="max-h-96 overflow-auto p-4 bg-slate-900/50 rounded-md border border-slate-700/30">
          <pre className="whitespace-pre-wrap text-slate-200 leading-relaxed m-0">{optimizedResumeMD}</pre>
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold">✓</span>
            </div>
            <div className="text-sm text-slate-300 font-medium">Pontos Fortes</div>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-2 text-slate-100">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 text-sm mt-1">•</span>
                  <span className="text-sm leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-400">Nenhum ponto forte identificado.</div>
          )}
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">⚠</span>
            </div>
            <div className="text-sm text-slate-300 font-medium">Gaps / O que melhorar</div>
          </div>
          {gaps.length > 0 ? (
            <ul className="space-y-2 text-slate-100">
              {gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 text-sm mt-1">•</span>
                  <span className="text-sm leading-relaxed">{g}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-400">Nenhum gap identificado.</div>
          )}
        </div>
      </div>

      {/* Behavioral analysis */}
      {behavioralAnalysis && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-purple-400 text-xs font-bold">🧠</span>
            </div>
            <div className="text-sm text-slate-300 font-medium">Análise comportamental (hipóteses)</div>
          </div>
          <div className="text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-900/50 rounded-md p-3 border-l-2 border-purple-500/30">
            {behavioralAnalysis}
          </div>
        </div>
      )}
    </div>
  </ResultBlock>
)}

{coverLetterMD && (
  <ResultBlock title="Carta de Apresentação" defaultCollapsed={true}>
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
          <span className="text-blue-400 text-xs font-bold">✉️</span>
        </div>
        <div className="text-sm text-slate-300 font-medium">Carta personalizada</div>
      </div>
      <div className="bg-slate-900/50 rounded-md p-4 border-l-2 border-blue-500/30">
        <pre className="whitespace-pre-wrap text-slate-200 leading-relaxed m-0">{coverLetterMD}</pre>
      </div>
    </div>
  </ResultBlock>
)}

{(interviewQA.length > 0 || interviewerQuestions.length > 0) && (
  <ResultBlock title="Simulação de Entrevista" defaultCollapsed={true}>
    <div className="space-y-6">
      {/* QA do entrevistado */}
      {interviewQA.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-slate-200 font-semibold mb-2">Perguntas ao entrevistado:</h2>
          {interviewQA.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:border-slate-600/50 transition-all duration-200"
            >
              {/* Pergunta */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">P</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-100 leading-relaxed">{item.question}</p>
                </div>
              </div>

              {/* Resposta */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-emerald-400 text-xs font-bold">R</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-200 leading-relaxed bg-slate-900/50 rounded-md p-3 border-l-2 border-emerald-500/30">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Perguntas para o entrevistador */}
      {interviewerQuestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-slate-200 font-semibold mb-2">Perguntas para fazer ao entrevistador:</h2>
      {interviewerQuestions.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:border-slate-600/50 transition-all duration-200"
                  >

                    {/* Resposta */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-blue-400 text-xs font-bold">P</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-200 leading-relaxed bg-slate-900/50 rounded-md p-3 border-l-2 border-emerald-500/30">
                          {item}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
        </div>
      )}
    </div>
  </ResultBlock>
)}

    </div>
  );
}
