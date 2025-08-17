"use client";

import { useState } from "react";
import {
  uploadResume,
  generateResumeSummaryAPI,
  generateOptimizedResume,
  generateCoverLetter,
  simulateInterview,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ResultBlock from "./ResultBlock";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, Sparkles, FileText, MessageSquare } from "lucide-react";

export default function JobForm() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeId, setResumeId] = useState<string>("");
  const [jobDesc, setJobDesc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [parsedPreview, setParsedPreview] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [resumeSummary, setResumeSummary] = useState<string>("");
  const [summaryExpanded, setSummaryExpanded] = useState<boolean>(false);
  const [optimizedResumeMD, setOptimizedResumeMD] = useState<string>("");
  const [coverLetterMD, setCoverLetterMD] = useState<string>("");
  const [interviewQA, setInterviewQA] = useState<Array<{ question: string; answer: string }>>([]);
  const [matchScore, setMatchScore] = useState<number | null>(null);

  async function handleUpload() {
    if (!file) return alert("Selecione um arquivo de currículo (PDF/DOCX).");
    setLoading(true);
    setParsedPreview("");
    setExtractedText("");
    setResumeSummary("");
    setSummaryExpanded(false);

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
            <div className="max-h-72 overflow-auto p-3 bg-slate-900/30 rounded-md border border-slate-700 space-y-2">
              {extractedText.split("\n").map((line, idx) => (
                <p key={idx} className="text-slate-100">{line}</p>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 mb-3">Nenhum texto legível extraído do arquivo.</div>
        )}

        <div>
          <div className="text-xs text-slate-400 mb-1">Resumo (IA):</div>
          {resumeSummary ? (
            <div>
              <div className="text-slate-100 space-y-2">
                {(summaryExpanded ? resumeSummary : resumeSummary.slice(0, 800))
                  .split("\n")
                  .map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
              </div>

              {resumeSummary.length > 800 && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    onClick={() => setSummaryExpanded((v) => !v)}
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    {summaryExpanded ? "Mostrar menos" : "Mostrar mais"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Resumo não disponível — talvez o arquivo seja uma imagem/scan ou a IA não respondeu.
            </div>
          )}
        </div>
      </div>
    );
  }

  async function handleOptimize() {
    if (!resumeId) return alert("Envie e processe o currículo antes.");
    if (!jobDesc.trim()) return alert("Cole a descrição da vaga.");
    setLoading(true);
    try {
      const opt = await generateOptimizedResume(resumeId, jobDesc, extractedText);
      setOptimizedResumeMD(opt.optimizedResumeMarkdown);
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
      setCoverLetterMD(result.coverLetterMarkdown);
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
    if (raw === null || raw === undefined) return { question: "", answer: "" };
    if (typeof raw === "string") return { question: raw, answer: "" };

    if (typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      const q =
        (obj.question ?? obj.pergunta ?? obj.q ?? obj.question_text ?? obj.pergunta_text ?? obj.q_text) ?? "";
      const a =
        (obj.answer ??
          obj.resposta ??
          obj.a ??
          obj.answer_text ??
          obj.resposta_text ??
          obj.a_text ??
          obj.reply) ??
        "";

      return { question: String(q), answer: String(a) };
    }

    return { question: String(raw), answer: "" };
  };

  const extractFromPossibleContainer = (container: unknown): InterviewItem[] => {
    // se for array, normaliza cada item
    if (Array.isArray(container)) {
      return container.map((it) => normalizeRawItem(it));
    }

    // se for objeto com chaves que guardam o array
    if (typeof container === "object" && container !== null) {
      const obj = container as Record<string, unknown>;
      const candidateKeys = [
        "qa",
        "questionsAndAnswers",
        "questions_and_answers",
        "questions",
        "items",
        "data",
        "answers",
      ];

      for (const key of candidateKeys) {
        const val = obj[key];
        if (Array.isArray(val)) return val.map((it) => normalizeRawItem(it));
      }

      // se o próprio objeto é um item único com question/answer
      if ("question" in obj || "pergunta" in obj || "answer" in obj || "resposta" in obj) {
        return [normalizeRawItem(obj)];
      }
    }

    // nada reconhecido
    return [];
  };

  try {
    const result = await simulateInterview(resumeId, jobDesc, extractedText);
    console.log("Resposta da simulação (raw):", result);

    const normalized: InterviewItem[] = extractFromPossibleContainer(result);

    // fallback: se veio { interview: {...} } ou { data: {...} }
    if (normalized.length === 0 && typeof result === "object" && result !== null) {
      const obj = result as Record<string, unknown>;
      // tenta localizar dentro de chaves comuns
      const alt = obj.interview ?? obj.body ?? obj.payload ?? obj.result ?? obj.data;
      const altNormalized = extractFromPossibleContainer(alt);
      if (altNormalized.length > 0) {
        setInterviewQA(altNormalized);
      } else {
        setInterviewQA([]); // nada útil
      }
    } else {
      setInterviewQA(normalized);
    }
  } catch (e: unknown) {
    console.error("[handleInterview] erro:", e);
    alert("Falha ao gerar simulação de entrevista.");
  } finally {
    setLoading(false);
  }
}



  return (
    <div className="grid gap-5 text-slate-100">
      {/* Upload + botão (alinhamento vertical corrigido) */}
<div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
  {/* Cartão de seleção de arquivo */}
  <div className="grid gap-2">
    <label className="text-sm text-slate-100">Currículo (PDF/DOCX)</label>

    <div className="relative h-[54px]"> {/* altura fixa */}
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

  {/* Botão de enviar - altura compatível */}
  <Button
    onClick={handleUpload}
    disabled={loading || !file}
    className="h-[48px] flex items-center justify-center gap-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors md:ml-3"
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

      {/* Descrição da vaga dentro de aba colapsável */}
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
        <Button onClick={handleOptimize} disabled={loading || !resumeId || !jobDesc.trim()} className="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Otimizar Currículo
        </Button>

        <Button onClick={handleCover} variant="secondary" disabled={loading || !resumeId || !jobDesc.trim()} className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
          Gerar Carta
        </Button>

        <Button onClick={handleInterview} variant="secondary" disabled={loading || !resumeId || !jobDesc.trim()} className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
          Simular Entrevista
        </Button>
      </div>

      {matchScore !== null && (
        <ResultBlock title="Aderência à vaga" defaultCollapsed={true}>
          <div>
            <p className="text-sm">Score: <strong>{(matchScore * 100).toFixed(1)}%</strong></p>
            <p className="text-xs text-slate-400">*estimado com embeddings; ajuste no backend</p>
          </div>
        </ResultBlock>
      )}

      {optimizedResumeMD && (
        <ResultBlock title="Currículo Otimizado" defaultCollapsed={true}>
          <div className="space-y-2">
            {optimizedResumeMD.split("\n").map((line, idx) => (
              <p key={idx} className="text-slate-100">{line}</p>
            ))}
          </div>
        </ResultBlock>
      )}

      {coverLetterMD && (
        <ResultBlock title="Carta de Apresentação" defaultCollapsed={true}>
          <div className="space-y-2">
            {coverLetterMD.split("\n").map((line, idx) => (
              <p key={idx} className="text-slate-100">{line}</p>
            ))}
          </div>
        </ResultBlock>
      )}

      {interviewQA.length > 0 && (
        <ResultBlock title="Simulação de Entrevista" defaultCollapsed={true}>
          <ul className="space-y-2">
            {interviewQA.map((item, idx) => (
              <li key={idx}>
                <p className="font-medium text-slate-100">Q: {item.question}</p>
                <p className="text-slate-100">A: {item.answer}</p>
              </li>
            ))}
          </ul>
        </ResultBlock>
      )}
    </div>
  );
}
