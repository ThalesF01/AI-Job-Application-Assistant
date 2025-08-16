"use client";

import { useState } from "react";
import { uploadResume, matchJob, generateOptimizedResume, generateCoverLetter, simulateInterview } from "@/lib/api";
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
  const [extractedText, setExtractedText] = useState<string>(""); // texto extraído
  const [resumeSummary, setResumeSummary] = useState<string>(""); // resumo IA
  const [summaryExpanded, setSummaryExpanded] = useState<boolean>(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [optimizedResumeMD, setOptimizedResumeMD] = useState<string>("");
  const [coverLetterMD, setCoverLetterMD] = useState<string>("");
  const [interviewQA, setInterviewQA] = useState<Array<{ question: string; answer: string }>>([]);

  async function handleUpload() {
    if (!file) return alert("Selecione um arquivo de currículo (PDF/DOCX).");
    setLoading(true);
    setParsedPreview("");
    setExtractedText("");
    setResumeSummary("");
    setSummaryExpanded(false);

    try {
      const { resume_id, parsed, extractedText: extText, summary } = await uploadResume(file);

      setResumeId(resume_id);

      const preview = parsed?.skills?.length
        ? `**Skills:** ${parsed.skills.join(", ")}`
        : "Currículo processado.";
      setParsedPreview(preview);

      setExtractedText(extText || "");

      if (summary && summary.trim().length > 0) {
        setResumeSummary(summary);
      } else {
        setResumeSummary("");
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

        {/* Bloco maior com texto extraído ( rolável ) */}
        {extractedText ? (
          <div className="mb-3">
            <div className="text-xs text-slate-400 mb-1">Texto extraído (visualização):</div>
            <pre className="whitespace-pre-wrap text-slate-100 max-h-72 overflow-auto p-3 bg-slate-900/30 rounded-md border border-slate-700">{extractedText}</pre>
          </div>
        ) : (
          <div className="text-xs text-slate-400 mb-3">Nenhum texto legível extraído do arquivo.</div>
        )}

        {/* Resumo da IA (no mesmo bloco, abaixo) */}
        <div>
          <div className="text-xs text-slate-400 mb-1">Resumo (IA):</div>

          {resumeSummary ? (
            <div>
              <div className="text-slate-100">
                {summaryExpanded ? (
                  <pre className="whitespace-pre-wrap text-slate-100">{resumeSummary}</pre>
                ) : (
                  <pre className="whitespace-pre-wrap text-slate-100 max-h-28 overflow-hidden">{resumeSummary}</pre>
                )}
              </div>

              {resumeSummary.length > 800 && (
                <div className="mt-2">
                  <Button size="sm" onClick={() => setSummaryExpanded(v => !v)} className="bg-slate-700 hover:bg-slate-600">
                    {summaryExpanded ? "Mostrar menos" : "Mostrar mais"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400">Resumo não disponível — talvez o arquivo seja uma imagem/scan ou a IA não respondeu.</div>
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
      const m = await matchJob(resumeId, jobDesc);
      setMatchScore(m.score);
      const opt = await generateOptimizedResume(resumeId, jobDesc);
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
      const cov = await generateCoverLetter(resumeId, jobDesc);
      setCoverLetterMD(cov.coverLetterMarkdown);
    } catch (e: unknown) {
      console.error(e);
      alert("Falha ao gerar carta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleInterview() {
    if (!resumeId) return alert("Envie e processe o currículo antes.");
    if (!jobDesc.trim()) return alert("Cole a descrição da vaga.");
    setLoading(true);
    try {
      const sim = await simulateInterview(resumeId, jobDesc);
      setInterviewQA(sim.qa);
    } catch (e: unknown) {
      console.error(e);
      alert("Falha na simulação de entrevista.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 text-slate-100">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] items-end">
        <div className="grid gap-2">
          <label className="text-sm text-slate-100">Currículo (PDF/DOCX)</label>

          <div className="relative w-full">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
              aria-label="Selecionar currículo"
            />

            <div className="w-full py-2 px-4 bg-slate-800/60 border border-slate-700 rounded-lg flex items-center justify-between gap-3 shadow-sm hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-slate-700/60 text-slate-200">📁</span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-100 truncate">{file ? file.name : "Selecionar currículo"}</div>
                  <div className="text-xs text-slate-400">{file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF ou DOCX • máximo X MB"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Arraste ou clique</span>
                <span className="hidden md:inline-block px-3 py-1 rounded bg-slate-700 text-xs text-slate-200">Selecionar</span>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full md:w-auto cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Enviar & Processar
        </Button>
      </div>

      {/* Único bloco de resultado: prévia + texto extraído + resumo (tudo junto) */}
      {(parsedPreview || extractedText || resumeSummary) && (
        <ResultBlock title="Prévia do currículo" content={renderPreviewContent()} />
      )}

      <Separator className="bg-slate-700" />

      <div className="grid gap-2">
        <label className="text-sm text-slate-100">Descrição da vaga</label>
        <Textarea
          placeholder="Cole aqui a descrição da vaga..."
          rows={8}
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          className="bg-slate-800/60 text-slate-100 placeholder:text-slate-400 border border-slate-700"
        />
      </div>

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
        <ResultBlock
          title="Aderência à vaga"
          content={
            <div>
              <p className="text-sm">Score: <strong>{(matchScore * 100).toFixed(1)}%</strong></p>
              <p className="text-xs text-slate-400">*estimado com embeddings; ajuste no backend</p>
            </div>
          }
        />
      )}

      {optimizedResumeMD && (
        <ResultBlock title="Currículo Otimizado (Markdown)" content={<pre className="whitespace-pre-wrap text-slate-100">{optimizedResumeMD}</pre>} />
      )}

      {coverLetterMD && (
        <ResultBlock title="Carta de Apresentação" content={<pre className="whitespace-pre-wrap text-slate-100">{coverLetterMD}</pre>} />
      )}

      {interviewQA.length > 0 && (
        <ResultBlock
          title="Simulação de Entrevista"
          content={
            <ul className="space-y-2">
              {interviewQA.map((item, idx) => (
                <li key={idx}>
                  <p className="font-medium text-slate-100">Q: {item.question}</p>
                  <p className="text-slate-100">A: {item.answer}</p>
                </li>
              ))}
            </ul>
          }
        />
      )}
    </div>
  );
}
