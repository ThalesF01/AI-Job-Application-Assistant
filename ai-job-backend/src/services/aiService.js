// src/services/aiService.js
import Groq from "groq-sdk";

let groq = null;
if (process.env.GROQ_API_KEY) {
  try {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  } catch (e) {
    console.error("[aiService] falha ao criar cliente Groq:", e?.message || e);
    groq = null;
  }
} else {
  groq = null;
  console.warn("[aiService] GROQ_API_KEY não configurado — pulando Groq client.");
}

export async function generateResumeSummary(resumeText) {
  if (!resumeText || !resumeText.trim()) return null;
  if (!groq) {
    throw new Error("Groq client não inicializado (GROQ_API_KEY ausente).");
  }

  const fewShotExamples = `
Exemplo 1:
Currículo: João Silva, Engenheiro de Software. Experiência como Engenheiro de Software na Empresa X (2019 – Presente)...
Resumo: Engenheiro de software com mais de 5 anos de experiência em backend e microsserviços, especialista em Java e AWS.

Exemplo 2:
Currículo: Maria Oliveira, Analista de Dados. Experiência como Analista de Dados na Empresa Z (2020 – Presente)...
Resumo: Analista de dados com experiência sólida em Python, SQL e BI, especialista em dashboards no Tableau e automação de processos.
`;

  const prompt = `
Você é um especialista em recrutamento e análise de currículos.
Seu objetivo é gerar um resumo profissional de 3 a 9 linhas, claro e conciso.
Siga estas regras:
1. Foque em habilidades técnicas, experiências-chave e formações relevantes.
2. Ignore contatos pessoais, links, GitHub, LinkedIn ou e-mails.
3. Não copie literalmente o texto do currículo, condense e interprete.
4. Mantenha o estilo formal e profissional.
Exemplos:
${fewShotExamples}

Currículo do candidato:
${resumeText}

Resumo Profissional:
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    });

    const summary = response.choices?.[0]?.message?.content?.trim() ?? null;
    return summary;
  } catch (err) {
    console.error("[generateResumeSummary] erro:", err);
    return null;
  }
}
