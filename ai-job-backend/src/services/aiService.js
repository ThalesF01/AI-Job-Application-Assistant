// src/services/aiService.js
const Groq = require("groq-sdk").default;

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

/**
 * generateResumeSummary - mantém a sua implementação original (pequenas mudanças de estilo)
 */
async function generateResumeSummary(resumeText) {
  if (!resumeText?.trim()) return null;
  if (!groq) {
    throw new Error("Groq client não inicializado (GROQ_API_KEY ausente).");
  }

  const fewShotExamples = `
Exemplo 1:
Currículo: João Silva, Engenheiro de Software. Experiência em backend Java, AWS (EC2, RDS), projetos de alta disponibilidade, microservices, metodologias ágeis (Scrum), formação em Ciência da Computação.

Análise detalhada:
O currículo de João está bem estruturado e apresenta informações relevantes para vagas de engenharia de software. As experiências técnicas são sólidas e compatíveis com o que se espera para a função de backend, mostrando conhecimento em cloud e desenvolvimento de sistemas escaláveis. No entanto, a apresentação poderia ser mais visual, usando bullets claros para responsabilidades e resultados, e destacando métricas de impacto dos projetos. Apesar de ter habilidades técnicas importantes, faltam menções explícitas a soft skills e certificações, que poderiam enriquecer o perfil para ATS e recrutadores.

Pontos Fortes:
- Experiência técnica relevante e alinhada com backend e AWS.
- Experiência prática em microservices e metodologias ágeis.
- Formação acadêmica adequada.

Pontos Fracos:
- Falta de estrutura visual consistente e seções claras.
- Poucos resultados mensuráveis apresentados.
- Soft skills e certificações não destacadas.

Sugestões de Melhoria:
- Reformular experiência em bullets com métricas.
- Criar seção de habilidades técnicas e certificações.
- Destacar soft skills importantes para a função.

Exemplo 2:
Currículo: Maria Oliveira, Analista de Dados. Experiência em Python, SQL, Power BI, Tableau, automação de relatórios e dashboards estratégicos, formação em Estatística.

Análise detalhada:
Maria possui um currículo bem focado para a área de análise de dados. As tecnologias apresentadas são atuais e relevantes, mostrando capacidade de trabalhar com grandes volumes de dados e apresentar insights estratégicos. A estrutura textual, porém, é linear e pouco escaneável; bullets claros ajudariam a destacar resultados e responsabilidades. Também seria interessante separar seções de certificações e soft skills para reforçar o perfil para ATS e recrutadores humanos.

Pontos Fortes:
- Habilidades técnicas e ferramentas bem definidas e relevantes.
- Experiência prática e aplicável para a função.
- Boa formação acadêmica.

Pontos Fracos:
- Estrutura linear e pouco visualmente escaneável.
- Resultados não quantificados em projetos.
- Certificações e soft skills não destacadas.

Sugestões de Melhoria:
- Organizar experiências em bullets separados.
- Adicionar métricas e resultados nos projetos.
- Criar seção de certificações e destacar soft skills.
`;


  const prompt = `
Você é um especialista em RH e recrutamento.
Seu objetivo é avaliar criticamente o currículo de um candidato, considerando:
- Legibilidade e clareza
- Formatação e organização (seções, bullets, títulos)
- Compatibilidade com sistemas ATS
- Pontos fortes e fracos do conteúdo
- Sugestões de melhoria

Regras:
1. Não invente experiências ou formações.
2. Seja objetivo, profissional e claro.
4. Mantenha o estilo formal e conciso.

Exemplos:
${fewShotExamples}

Currículo do candidato:
${resumeText}

Avaliação:
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
      max_tokens: 500,
    });

    const evaluation = response.choices?.[0]?.message?.content?.trim() ?? null;
    return evaluation;
  } catch (err) {
    console.error("[generateResumeEvaluation] erro:", err);
    return null;
  }
}

/**
 * generateOptimizedResume - nova versão.
 * Retorna um objeto com os campos:
 * { optimizedResumeMarkdown, originalScore, optimizedScore, strengths, gaps, behavioralAnalysis }
 */
async function generateOptimizedResume(resumeText, jobDescription) {
  if (!resumeText || !resumeText.trim()) return null;
  if (!jobDescription || !jobDescription.trim()) {
    throw new Error("jobDescription é obrigatório para otimização.");
  }
  if (!groq) {
    throw new Error("Groq client não inicializado. Configure GROQ_API_KEY no .env.");
  }

  // Few-shot com 2 exemplos otimizados (saída JSON, optimizedResume em formato "bonito" plain-text)
const fewShot = `
Exemplo 1:
Currículo: THALES FISCUS — Desenvolvedor de Inteligência Artificial
Resumo profissional: Profissional de Tecnologia com foco em Inteligência Artificial aplicada, NLP e soluções generativas. Experiência prática com Python, TensorFlow e PyTorch, integração de LLMs com LangChain e Hugging Face, e implementação de arquiteturas RAG e pipelines de embeddings para uso em chatbots e automações internas.
Seções típicas existentes: Resumo Profissional, Habilidades Técnicas, Experiência Profissional (com bullets e resultados), Formação, Projetos Relevantes.

Vaga: Especialista em IA Conversacional — foco em desenvolvimento de assistentes virtuais, pipelines de NLP, integração de LLMs, deploy em cloud e MLOps.
Output (JSON):
{
  "optimizedResume": "RESUMO PROFISSIONAL:\\nThales Fiscus — Desenvolvedor de IA especializado em soluções conversacionais com 3+ anos de experiência no desenvolvimento de assistentes virtuais inteligentes e arquiteturas RAG. Expert em pipelines de NLP que processam 10.000+ interações diárias com 94% de precisão, integrando LLMs via LangChain e Hugging Face. Histórico comprovado de otimizações que resultaram em 40% de redução no tempo de processamento e 60% de melhoria na satisfação do usuário. Domínio técnico em deploy cloud e automações internas, com capacidade de traduzir necessidades de negócio em soluções de IA escaláveis e robustas.\\n\\nHABILIDADES PRINCIPAIS:\\n• Linguagens: Python (avançado), JavaScript/TypeScript, SQL\\n• ML & NLP: TensorFlow, PyTorch, scikit-learn, NLTK, spaCy\\n• LLMs & IA Generativa: LangChain, Hugging Face, OpenAI API, Claude API\\n• Arquiteturas: RAG, Vector Databases (Pinecone, Weaviate), Embeddings\\n• Cloud & Deploy: AWS (SageMaker, Lambda, EC2), Docker, Kubernetes\\n• Web Development: Node.js, Next.js, FastAPI, APIs REST\\n\\nEXPERIÊNCIA PROFISSIONAL:\\n\\nAnalista de Sistemas — Mastercoin Comércio e Serviços\\nSetembro 2023 – Presente\\n• Desenvolveu chatbot inteligente com arquitetura RAG integrando base corporativa, resultando em 75% de redução no tempo de atendimento interno\\n• Implementou pipeline de NLP para análise de documentos empresariais com extração de entidades e sumarização automática\\n• Projetou integrações com APIs externas (CRM, ERP) usando Python/FastAPI, automatizando 85% dos processos manuais de entrada de dados\\n\\nAnalista de Dados — Yduqs (Grupo Estácio)\\nFevereiro 2022 – Dezembro 2022\\n• Construiu pipeline NLP end-to-end para análise de 50.000+ comentários mensais, com pré-processamento e vetorização usando TF-IDF e Word2Vec\\n• Desenvolveu modelos de classificação de texto para categorização automática alcançando 91% de acurácia e 40% de redução no tempo de triagem\\n• Implementou ETL automatizado com Apache Airflow para múltiplas fontes educacionais, criando dashboards Power BI integrados\\n\\nPROJETOS RELEVANTES:\\n\\nChatbot Empresarial com RAG (2023-2024)\\n• Assistente virtual completo com LangChain, processando 1.000+ documentos através de embeddings semânticos e Pinecone\\n• Integração multi-LLM (GPT-4, Claude) com cache para otimização de custos\\n• Resultado: 94% precisão, 3.2s tempo médio, 60% economia em atendimento humano\\n\\nSistema Análise Sentimento Tempo Real (2022)\\n• API com BERT fine-tuned para domínio educacional, arquitetura microserviços Docker/AWS ECS\\n• Performance: 15ms latência, 1.000 requests/segundo\\n\\nFORMAÇÃO ACADÊMICA:\\n\\nPós-graduação em Inteligência Artificial e Machine Learning\\nPUC-SP (Pontifícia Universidade Católica de São Paulo)\\nMarço 2024 – Dezembro 2025 (em andamento)\\nEspecializações: Deep Learning, NLP Avançado, MLOps\\n\\nTecnólogo em Análise e Desenvolvimento de Sistemas\\nFATEC (Faculdade de Tecnologia de São Paulo)\\nFevereiro 2019 – Dezembro 2021\\nTCC: 'Sistema de Recomendação usando Collaborative Filtering' (Nota: 10.0)\\n\\nCERTIFICAÇÕES:\\n• AWS Certified Machine Learning – Specialty (2023)\\n• TensorFlow Developer Certificate (2023)\\n• LangChain for LLM Application Development - DeepLearning.AI (2023)",
  "originalScore": 58,
  "optimizedScore": 91,
  "strengths": [
    "Experiência prática sólida em NLP e RAG com resultados quantificados",
    "Domínio técnico abrangente desde desenvolvimento até deploy",
    "Histórico comprovado de otimização e melhoria de performance",
    "Experiência com múltiplas tecnologias LLM e frameworks modernos"
  ],
  "gaps": [
    "Experiência limitada com MLOps avançado (feature stores, model versioning)",
    "Deploy em larga escala com A/B testing de modelos",
    "Experiência com múltiplas clouds além do AWS"
  ],
  "behavioralAnalysis": "Perfil inovador e orientado a resultados, com forte capacidade de autoaprendizagem tecnológica. Demonstra mentalidade analítica para problemas complexos e habilidade para traduzir necessidades de negócio em soluções técnicas viáveis. Histórico de liderança técnica com foco em entregas práticas que geram valor mensurável."
}

Exemplo 2:
Currículo: Mariana Souza — MLOps & Machine Learning Engineer
Resumo profissional: Engenheira de MLOps com 5 anos de experiência operacionalizando pipelines de ML em produção, automação de deploys, orquestração com Airflow, monitoramento de modelos e práticas de validação de dados.
Seções típicas: Resumo Profissional, Skills, Experiência, Formação, Certificações, Projetos.

Vaga: MLOps Engineer — automação de pipelines, deploy & observability, infraestrutura como código.
Output (JSON):
{
  "optimizedResume": "RESUMO PROFISSIONAL:\\nMariana Souza — Engenheira de MLOps sênior com 5+ anos transformando modelos experimentais em sistemas robustos de produção em alta escala. Expert em reduzir tempo de deploy de semanas para dias (70% redução) e eliminar 90% das falhas em produção através de práticas DevOps/MLOps avançadas. Domínio profundo em orquestração Apache Airflow, infraestrutura como código (Terraform) e estratégias de observabilidade para sistemas ML. Liderou implementação de plataformas MLOps servindo 200+ modelos com 99.9% disponibilidade, estabelecendo padrões organizacionais de qualidade e governança. Perfil técnico-estratégico com habilidades de liderança para construir cultura de confiabilidade e automação.\\n\\nHABILIDADES PRINCIPAIS:\\n• Orquestração: Apache Airflow, Prefect, Kubeflow, Apache Beam\\n• Cloud Platforms: AWS (SageMaker, ECS, Lambda), GCP (Vertex AI, BigQuery)\\n• Containers & K8s: Docker, Kubernetes, Helm Charts, Istio\\n• Infraestrutura: Terraform, CloudFormation, GitOps (ArgoCD)\\n• CI/CD: Jenkins, GitLab CI, MLflow, DVC (Data Version Control)\\n• Observabilidade: Prometheus, Grafana, ELK Stack, MLflow Tracking\\n• Linguagens: Python, Go, SQL, Bash\\n\\nEXPERIÊNCIA PROFISSIONAL:\\n\\nSenior MLOps Engineer — TechCorp Solutions\\nJaneiro 2021 – Presente (4 anos 1 mês) | São Paulo, SP\\n• Arquitetou plataforma MLOps end-to-end servindo 12+ equipes de DS, processando 500GB+ diários com 99.9% disponibilidade\\n• Desenvolveu pipelines Airflow complexos automatizando ciclo completo ML, reduzindo time-to-market de 6 semanas para 3 dias\\n• Implementou deploy canary/blue-green com Kubernetes/Istio, eliminando 95% dos incidentes de deploy de modelos\\n• Estabeleceu monitoramento drift com Evidently AI e Prometheus, detectando degradações 80% mais rapidamente\\n\\nMLOps Engineer — DataFlow Innovations\\nMarço 2019 – Dezembro 2020 (1 ano 10 meses) | Campinas, SP\\n• Projetou pipeline ML para sistema recomendação e-commerce servindo 2M+ usuários com 45ms latência média\\n• Desenvolveu framework testes automatizados para modelos (unidade, integração, validação estatística), aumentando confiabilidade 85%\\n• Implementou feature store com Feast/Redis para compartilhamento eficiente, reduzindo duplicação 60%\\n\\nJunior Data Engineer — StartupTech Analytics\\nJunho 2018 – Fevereiro 2019 (9 meses) | São Paulo, SP\\n• Desenvolveu pipelines ETL Apache Spark/Python processando 100GB+ diariamente de múltiplas fontes\\n• Implementou validações automatizadas de qualidade com alertas, reduzindo incidentes dados corrompidos 70%\\n\\nPROJETOS RELEVANTES:\\n\\nPlataforma MLOps Corporativa (2021-2024)\\n• Liderou arquitetura Kubeflow servindo 200+ modelos, GitOps completo com versionamento automático\\n• Estabeleceu governança/auditoria para compliance LGPD e SOX\\n• Resultado: 300% aumento produtividade DS, 90% redução incidentes produção\\n\\nDetecção Fraude Tempo Real (2020-2021)\\n• Pipeline ML tempo real Kafka/Flink para transações fraudulentas\\n• Modelo ensemble com retreinamento online e A/B testing\\n• Performance: <100ms latência, 97% precisão, 50K transações/segundo\\n\\nFORMAÇÃO ACADÊMICA:\\n\\nMestrado em Ciência da Computação\\nUniversidade Estadual de Campinas (UNICAMP)\\nMarço 2016 – Dezembro 2018\\nÁrea: Sistemas Distribuídos e Machine Learning\\nDissertação: 'Otimização de Pipelines ML em Ambientes Cloud' (Distinção)\\n\\nBacharelado em Engenharia de Computação\\nUniversidade de São Paulo (USP) - Escola Politécnica\\nFevereiro 2011 – Dezembro 2015\\nTCC: 'Sistema Monitoramento Distribuído Clusters Hadoop' (Nota: 9.5)\\n\\nCERTIFICAÇÕES:\\n• AWS Certified DevOps Engineer - Professional (2023)\\n• Google Cloud Professional ML Engineer (2023)\\n• Certified Kubernetes Administrator (CKA) - CNCF (2022)\\n• Terraform Associate (2021)",
  "originalScore": 70,
  "optimizedScore": 95,
  "strengths": [
    "Experiência comprovada MLOps com resultados quantificados e impacto organizacional",
    "Domínio técnico abrangente desde infraestrutura até observabilidade de modelos",
    "Histórico de liderança técnica estabelecendo padrões e práticas",
    "Experiência sólida com ferramentas modernas orquestração e automação"
  ],
  "gaps": [
    "Experiência limitada com edge computing e deploy IoT",
    "Conhecimento específico compliance setores regulados (saúde, financeiro)",
    "Experiência com ferramentas emergentes LLMOps e IA Generativa"
  ],
  "behavioralAnalysis": "Perfil altamente orientado a confiabilidade e processos, com mentalidade de engenharia de sistemas robustos. Forte capacidade de liderança técnica e visão estratégica para soluções escaláveis. Histórico de identificação proativa de riscos e implementação de mitigações efetivas. Mentor natural capaz de elevar capacidade técnica de equipes inteiras."
}
`;

  // Prompt principal: instruções MUITO CLARAS sobre não inventar
  const basePrompt = `
Você é um redator técnico especializado em reescrever currículos para torná-los amigáveis a ATS (Applicant Tracking Systems) e altamente aderentes a uma descrição de vaga.

ENTRADA: RECEBA o CURRÍCULO completo (texto extraído) e a DESCRIÇÃO DA VAGA.
SAÍDA: RETORNE exatamente um OBJETO JSON (apenas JSON) com as chaves:
- optimizedResume: string (formatação plain-text 'bonita' — seções em MAIÚSCULAS seguidas por conteúdo, bullets com '-' — NÃO use markdown)
- originalScore: number (0-100)
- optimizedScore: number (0-100)
- strengths: array of strings (principais pontos fortes)
- gaps: array of strings (lacunas / melhorias recomendadas)
- behavioralAnalysis: string (1-3 linhas com hipóteses de soft-skills)

REGRAS CRÍTICAS - LEIA COM ATENÇÃO:

1) JAMAIS INVENTE INFORMAÇÕES: 
   - NÃO adicione empresas que não existem no currículo original
   - NÃO invente datas, cargos, projetos ou experiências
   - NÃO crie certificações que não foram mencionadas
   - NÃO invente formações acadêmicas ou instituições
   - APENAS reorganize, reformule e destaque o que JÁ EXISTE no currículo fornecido

2) TRABALHE APENAS COM O QUE FOI FORNECIDO:
   - Use SOMENTE as informações presentes no currículo original
   - Se faltar informação para a vaga, mencione isso nos "gaps"
   - Pode reformular e reorganizar o texto para ficar mais atrativo
   - Pode adicionar palavras-chave da vaga se forem compatíveis com a experiência real

3) O campo optimizedResume deve ter entre 20 e 50 linhas (linhas não vazias). 
   - Produza uma seção "RESUMO PROFISSIONAL" detalhada baseada SOMENTE no que existe
   - Inclua seções adicionais (HABILIDADES, EXPERIÊNCIA, PROJETOS, FORMAÇÃO) usando APENAS informações reais
   - Use frases completas e bullets curtos
   - Seja amigável a ATS mencionando palavras-chave da vaga quando aplicáveis

4) Scores devem fazer sentido: originalScore geralmente <= optimizedScore.

5) Retorne apenas JSON (sem comentários, sem texto adicional). Use os exemplos do few-shot como guia de FORMATO, mas nunca copie o CONTEÚDO.

6) Seja objetivo e profissional no tom.

IMPORTANTE: Os exemplos do few-shot são apenas para mostrar o FORMATO da resposta. Você deve criar um currículo completamente baseado no currículo real fornecido abaixo, SEM inventar nada.

Few-shot (apenas para formato): ${fewShot}

Vaga:
${jobDescription}

Currículo Original (USE APENAS ESSAS INFORMAÇÕES):
${resumeText}

Retorne apenas o objeto JSON com as chaves solicitadas, baseado EXCLUSIVAMENTE no currículo fornecido acima.
`;

  // Helper para extrair/parsear JSON robustamente
  const parseJsonFromText = (text) => {
    if (!text || !text.trim()) return null;

    // remover fences ```json ``` e ``` ```
    let cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1").trim();

    // buscar primeiro '{' e último '}' para extrair JSON bruto
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = cleaned.slice(first, last + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {
        // tente extrair chaves comuns com regex - último recurso
      }
    }

    // fallback: tentar JSON.parse direto
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      return null;
    }
  };

  // função para normalizar saída
  const normalizeParsed = (parsed) => {
    if (!parsed || typeof parsed !== "object") {
      return {
        optimizedResume: parsed?.optimizedResume ?? parsed?.optimized_resume ?? parsed?.optimizedResumeMarkdown ?? null,
        originalScore: null,
        optimizedScore: null,
        strengths: [],
        gaps: [],
        behavioralAnalysis: null,
      };
    }

    const out = {
      optimizedResume:
        parsed.optimizedResume ??
        parsed.optimized_resume ??
        parsed.optimizedResumeMarkdown ??
        parsed.optimized_resume_markdown ??
        parsed.optimized_resume_text ??
        null,
      originalScore:
        typeof parsed.originalScore === "number"
          ? parsed.originalScore
          : typeof parsed.original_score === "number"
          ? parsed.original_score
          : null,
      optimizedScore:
        typeof parsed.optimizedScore === "number"
          ? parsed.optimizedScore
          : typeof parsed.optimized_score === "number"
          ? parsed.optimized_score
          : null,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.map(String) : [],
      behavioralAnalysis:
        parsed.behavioralAnalysis ??
        parsed.behavioral_analysis ??
        parsed.behavioral ??
        null,
    };

    return out;
  };

  // faz a chamada ao Groq — com tentativa adicional se precisar ajustar comprimento
  const runRequest = async (extraInstruction = "") => {
    const fullPrompt = extraInstruction ? basePrompt + "\n\n" + extraInstruction : basePrompt;
    try {
      const response = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: fullPrompt }],
        temperature: 0.15,
        max_tokens: 2200,
      });
      const textOut = response.choices?.[0]?.message?.content?.trim() ?? "";
      return textOut;
    } catch (err) {
      console.error("[aiService.generateOptimizedResume] Groq error:", err);
      throw err;
    }
  };

  try {
    // 1ª tentativa
    let textOut = await runRequest();

    let parsed = parseJsonFromText(textOut);
    let normalized = normalizeParsed(parsed);

    // validar contagem de linhas do optimizedResume
    const countLines = (s) =>
      (s || "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0).length;

    let lines = countLines(normalized.optimizedResume);

    // se não houver optimizedResume decente, tente extrair JSON direto do body (algumas respostas já retornaram objeto JS)
    if ((!normalized.optimizedResume || lines < 20 || lines > 50) && typeof textOut === "string") {
      // tentar parse direto novamente, e também tentar nova chamada pedindo estritamente 20-50 linhas
      if (!normalized.optimizedResume || lines < 20 || lines > 50) {
        // 2ª tentativa: reforçar a instrução de 20-50 linhas E não inventar
        const extra = `
ATENÇÃO CRÍTICA:
1) Gere o campo 'optimizedResume' com exatamente entre 20 e 50 linhas não vazias (linhas com texto).
2) Use formatação plain-text (seções em MAIÚSCULAS e bullets com '-'). Não retorne markdown.
3) JAMAIS INVENTE INFORMAÇÕES - use apenas o que existe no currículo original fornecido.
4) Se o currículo original tiver poucas informações, seja criativo na APRESENTAÇÃO, mas não invente experiências.
Apenas JSON como antes.`;
        try {
          const textOut2 = await runRequest(extra);
          const parsed2 = parseJsonFromText(textOut2);
          const normalized2 = normalizeParsed(parsed2);
          const lines2 = countLines(normalized2.optimizedResume);
          if (normalized2.optimizedResume && lines2 >= 20 && lines2 <= 50) {
            return normalized2;
          }
          // se ainda inválido, preferimos retornar o melhor que temos (normalized2 if present) ou fallback below
          if (normalized2.optimizedResume) {
            return normalized2;
          }
        } catch (err2) {
          console.warn("[aiService.generateOptimizedResume] Segunda tentativa falhou:", err2?.message || err2);
        }
      }
    }

    // se primeira parse já satisfaz, retorna normalized
    if (normalized.optimizedResume && lines >= 20 && lines <= 50) {
      return normalized;
    }

    // último recurso: se parse falhou, devolver algo "útil" mesmo assim
    if (!normalized.optimizedResume) {
      return {
        optimizedResume: textOut || null,
        originalScore: normalized.originalScore ?? null,
        optimizedScore: normalized.optimizedScore ?? null,
        strengths: normalized.strengths ?? [],
        gaps: normalized.gaps ?? [],
        behavioralAnalysis: normalized.behavioralAnalysis ?? null,
      };
    }

    // se chegou aqui, temos optimizedResume mas não dentro do limite; ainda assim retornamos com scores normalizados
    // garantir coerência dos scores
    if (typeof normalized.originalScore === "number") {
      normalized.originalScore = Math.max(0, Math.min(100, Math.round(normalized.originalScore)));
    }
    if (typeof normalized.optimizedScore === "number") {
      normalized.optimizedScore = Math.max(0, Math.min(100, Math.round(normalized.optimizedScore)));
    }

    return normalized;
  } catch (err) {
    console.error("[aiService.generateOptimizedResume] erro final:", err);
    // fallback robusto
    return {
      optimizedResume: null,
      originalScore: null,
      optimizedScore: null,
      strengths: [],
      gaps: [],
      behavioralAnalysis: null,
    };
  }
}

/**
 * generateCoverLetter - mantive sua função mas sem mudanças semânticas
 */
async function generateCoverLetter(resumeText, jobDescription) {
  if (!resumeText || !resumeText.trim()) return null;
  if (!jobDescription || !jobDescription.trim()) {
    throw new Error("jobDescription é obrigatório para gerar a carta de apresentação.");
  }
  if (!groq) {
    throw new Error("Groq client não inicializado. Configure GROQ_API_KEY no .env.");
  }

  const fewShot = `
Exemplo 1:
Currículo: Engenheiro de Software com 5 anos em backend Java, AWS (EC2, RDS),  projetos de alta disponibilidade.
Vaga: Engenheiro Backend (Java, AWS, microservices).
Carta de Apresentação: Prezados recrutadores, é com grande entusiasmo que me candidato à vaga de Engenheiro Backend. Tenho 5 anos de experiência em Java e AWS, liderei a migração de sistemas críticos para cloud, obtendo redução de 30% na latência. Estou motivado para aplicar minhas habilidades em arquiteturas escaláveis e APIs resilientes, alinhando tecnologia a impacto de negócio.
`;

  const prompt = `
Você é um especialista em RH. 
Crie uma **carta de apresentação personalizada em português** com base no currículo e na descrição da vaga.

Regras:
- Seja claro e objetivo.
- Mostre entusiasmo pela vaga.
- Use um tom profissional e amigável.
- Adapte os pontos fortes do candidato para o que a vaga pede.
- Estruture em texto corrido (não use JSON).
- Exemplo de guia (não copie literalmente): ${fewShot}

Vaga:
${jobDescription}

Currículo:
${resumeText}

Carta de apresentação:
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    });

    const coverLetter = response.choices?.[0]?.message?.content?.trim() ?? null;
    return coverLetter;
  } catch (err) {
    console.error("[aiService.generateCoverLetter] erro:", err);
    return null;
  }
}

/**
 * generateNewResume 
 */
async function generateNewResume(resumeText) {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("resumeText é obrigatório para gerar o novo currículo.");
  }
  if (!groq) {
    throw new Error("Groq client não inicializado. Configure GROQ_API_KEY no .env.");
  }

  // Few-shot com exemplos
  const fewShot = `
Exemplo 1:
Currículo: Engenheiro de Software com 5 anos de experiência em backend Java, AWS (EC2, RDS, S3), liderança de squads ágeis, otimização de sistemas de alta disponibilidade, integração de APIs RESTful e microserviços, monitoramento de performance e automação de deploy.
Saída (JSON):
{
  "newResume": "RESUMO PROFISSIONAL:\\n- Engenheiro de Software com 5 anos de experiência em desenvolvimento backend robusto e escalável, especializado em sistemas distribuídos, microserviços e cloud computing.\\n- Experiência comprovada em liderança de equipes ágeis, coordenação de sprints, definição de roadmap técnico e priorização de backlog.\\n- Forte habilidade em integração de APIs, otimização de performance e redução de latência em sistemas críticos.\\n\\nHABILIDADES TÉCNICAS:\\n- Linguagens: Java, Python, SQL, Kotlin\\n- Frameworks: Spring Boot, Hibernate, Micronaut\\n- Cloud: AWS (EC2, RDS, S3, Lambda, CloudFormation), Docker, Kubernetes\\n- Metodologias Ágeis: Scrum, Kanban, Lean\\n- Ferramentas: Git, Jenkins, SonarQube, JIRA, Confluence\\n- Monitoramento: Prometheus, Grafana, New Relic\\n\\nEXPERIÊNCIA PROFISSIONAL:\\n- Empresa X (2019–Presente):\\n  - Desenvolveu e manteve microserviços críticos com alta disponibilidade, reduzindo erros de produção em 25%.\\n  - Implementou pipelines CI/CD com Jenkins e Docker, diminuindo tempo de deploy em 40%.\\n  - Liderou squad ágil de 6 desenvolvedores, realizando code reviews, mentorias e workshops internos de boas práticas.\\n  - Projetou arquitetura de sistema que suportou aumento de 300% no volume de usuários sem downtime.\\n\\n- Empresa Y (2017–2019):\\n  - Desenvolvimento de APIs RESTful escaláveis e manutenção de sistemas legados.\\n  - Otimização de consultas SQL, reduzindo tempo de processamento de batch em 35%.\\n  - Colaboração com times de front-end e produto para entrega de features críticas dentro do prazo.\\n\\nFORMAÇÃO ACADÊMICA:\\n- Bacharel em Ciência da Computação, Universidade Z (2013–2017)\\n\\nCERTIFICAÇÕES:\\n- AWS Certified Solutions Architect – Associate\\n- Oracle Certified Professional, Java SE 11 Programmer\\n\\nPROJETOS E RECONHECIMENTOS:\\n- Sistema de monitoramento em tempo real que melhorou KPIs de latência em 30%\\n- Participação em hackathons internos com premiação de inovação em 2018",
  "changes": {
    "added": [
      "Seção HABILIDADES TÉCNICAS detalhada com tecnologias, cloud e metodologias",
      "Resultados quantitativos nas experiências",
      "Projetos e reconhecimentos incluídos",
      "Seção CERTIFICAÇÕES adicionada"
    ],
    "removed": [
      "Detalhes genéricos de tarefas administrativas ou repetitivas"
    ],
    "reorganized": [
      "Resumo profissional movido para o topo",
      "Experiência organizada por impacto e resultados",
      "Formação posicionada após experiência para melhor fluxo"
    ]
  },
  "explanation": "Reformulei o currículo para maximizar clareza, foco em resultados e palavras-chave ATS. Experiência reorganizada para destacar impacto e liderança. Habilidades, certificações e projetos adicionados para fortalecer perfil técnico e profissional."
}

Exemplo 2:
Currículo: Analista de Dados com 4 anos de experiência em Python, SQL, Power BI, Tableau, ETL, dashboards interativos e análise preditiva, atuando na extração de insights estratégicos para decisões de negócio em empresas de médio e grande porte.
Saída (JSON):
{
  "newResume": "RESUMO PROFISSIONAL:\\n- Analista de Dados com 4 anos de experiência em análise de dados complexos, criação de dashboards interativos, desenvolvimento de pipelines ETL e geração de insights estratégicos para apoiar decisões de negócio.\\n- Habilidade em traduzir dados em métricas acionáveis, visualizações interativas e relatórios gerenciais detalhados.\\n\\nHABILIDADES:\\n- Linguagens: Python, SQL, R\\n- Ferramentas: Power BI, Tableau, Excel Avançado, Jupyter Notebook\\n- Processos: ETL, análise preditiva, modelagem estatística, visualização de dados\\n- Soft Skills: Comunicação eficaz, storytelling com dados, resolução de problemas, colaboração em equipe\\n\\nEXPERIÊNCIA PROFISSIONAL:\\n- Empresa A (2020–Presente):\\n  - Desenvolvimento de dashboards estratégicos que aumentaram eficiência de decisão em 15%.\\n  - Automação de pipelines ETL, reduzindo tempo de processamento de dados em 40%.\\n  - Análise preditiva para vendas, prevendo tendências e identificando oportunidades de crescimento.\\n\\n- Empresa B (2018–2020):\\n  - Criação de relatórios financeiros detalhados e indicadores de performance.\\n  - Implementação de processos de qualidade de dados, aumentando confiabilidade em 20%.\\n\\nFORMAÇÃO:\\n- Bacharel em Estatística, Universidade X (2014–2018)\\n\\nCERTIFICAÇÕES:\\n- Microsoft Certified: Data Analyst Associate\\n- Google Data Analytics Certificate\\n\\nPROJETOS RELEVANTES:\\n- Pipeline de ETL automatizado que processa 2M+ registros por mês\\n- Dashboard interativo com KPIs estratégicos para diretoria, com drill-down em múltiplos níveis",
  "changes": {
    "added": [
      "Seção PROJETOS com métricas detalhadas",
      "Soft skills e storytelling com dados incluídos",
      "Keywords ATS para análise de dados e BI",
      "Certificações relevantes adicionadas"
    ],
    "removed": [
      "Tarefas operacionais sem impacto mensurável"
    ],
    "reorganized": [
      "Resumo movido para início",
      "Experiência reorganizada por impacto e relevância",
      "Formação posicionada após experiência e projetos"
    ]
  },
  "explanation": "Adicionei métricas, projetos e resultados quantificados para demonstrar impacto. Reorganizei experiência para maximizar visibilidade de conquistas. Inclusão de soft skills e certificações fortalece o perfil ATS e a leitura do currículo."
}

Exemplo 3:
Currículo: Gerente de Produto com 6 anos de experiência em produtos digitais, metodologias ágeis, roadmap estratégico, coordenação de equipes multifuncionais, otimização de processos de desenvolvimento e acompanhamento de KPIs de produto.
Saída (JSON):
{
  "newResume": "RESUMO PROFISSIONAL:\\n- Gerente de Produto com 6 anos de experiência liderando produtos digitais do conceito ao lançamento, incluindo definição de roadmap estratégico, priorização de backlog, acompanhamento de KPIs e métricas de sucesso.\\n- Experiência consolidada em coordenação de equipes multifuncionais, alinhamento entre áreas de tecnologia, design e marketing, e otimização de processos de desenvolvimento.\\n\\nHABILIDADES:\\n- Gestão de Produtos, Roadmap Estratégico, OKRs\\n- Metodologias Ágeis: Scrum, Kanban, Lean\\n- Ferramentas: Jira, Confluence, Miro, Google Analytics, Trello\\n- Soft Skills: Liderança, Comunicação, Resolução de Conflitos, Tomada de Decisão\\n\\nEXPERIÊNCIA PROFISSIONAL:\\n- Empresa X (2020–Presente):\\n  - Lançamento de plataforma SaaS, aumentando receita em 25%.\\n  - Definição de roadmap e priorização de backlog com base em métricas de uso e feedback de clientes.\\n  - Coordenação de squads ágeis, alinhando produto, design e engenharia para entrega eficiente de features críticas.\\n\\n- Empresa Y (2017–2020):\\n  - Otimização do ciclo de desenvolvimento, reduzindo bugs em 30% e aumentando eficiência da equipe em 20%.\\n  - Implantação de OKRs e indicadores de performance de produto, permitindo acompanhamento transparente de metas estratégicas.\\n\\nFORMAÇÃO ACADÊMICA:\\n- MBA em Gestão de Produtos, Universidade Y (2015–2017)\\n- Bacharel em Administração, Universidade Z (2010–2014)\\n\\nRECONHECIMENTOS:\\n- Prêmio interno de inovação 2019 por melhoria de processos\\n- Participação em workshops internacionais de gestão de produtos",
  "changes": {
    "added": [
      "Resultados detalhados e métricas de impacto",
      "Soft skills e ferramentas de gestão adicionadas",
      "Seção RECONHECIMENTOS incluída"
    ],
    "removed": [
      "Descrições genéricas de reuniões e tarefas administrativas",
      "Informações irrelevantes sem impacto"
    ],
    "reorganized": [
      "Resumo e experiência realocados para maior impacto",
      "Seção Habilidades e Reconhecimentos destacadas antes da formação"
    ]
  },
  "explanation": "O currículo foi expandido para evidenciar conquistas mensuráveis, destacar HABILIDADES técnicas e soft skills. Experiência reorganizada para maximizar impacto. Informações irrelevantes foram removidas para clareza e foco em resultados."
}
`;

  const basePrompt = `
Você é um especialista em RH e redação de currículos.

ENTRADA: Receba o CURRÍCULO completo (texto extraído).
SAÍDA: Retorne exatamente um OBJETO JSON válido (apenas JSON) com as chaves:
- newResume: string (formatação plain-text 'bonita' com seções em MAIÚSCULAS e bullets com '-') — deve ter entre 20 e 50 linhas não vazias
- changes: { added: string[], removed: string[], reorganized: string[] } — descreva o que foi adicionado, removido e reorganizado
- explanation: string (3 a 6 frases explicando claramente POR QUE as mudanças melhoram o currículo — ATS, legibilidade, foco em resultados)

REGRAS IMPORTANTES:
1) NÃO inventar informações. Use somente o que já existe no currículo original.
2) Não gere contatos ou links.
3) Mantenha tom profissional.
4) Seções ausentes devem aparecer em 'changes.added' ou 'changes.removed' como sugestão.
5) Retorne apenas JSON, sem comentários ou texto adicional.

Few-shot (apenas para formato): ${fewShot}

IMPORTANTE: Os exemplos do few-shot são apenas para mostrar o FORMATO da resposta. Você deve criar um currículo completamente baseado no currículo real fornecido abaixo, SEM inventar nada.

Currículo original:
${resumeText}
`;

  // Helper para parsear JSON
  const parseJsonFromText = (text) => {
    if (!text || !text.trim()) return null;
    let cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1").trim();

    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      try {
        return JSON.parse(cleaned.slice(first, last + 1));
      } catch (e) {}
    }
    try {
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  };

  // Normalização
  const normalizeParsed = (parsed) => {
    if (!parsed || typeof parsed !== "object") {
      return {
        newResume: null,
        changes: { added: [], removed: [], reorganized: [] },
        explanation: null,
      };
    }
    return {
      newResume: (parsed.newResume ?? parsed.resume ?? "").toString().trim() || null,
      changes: {
        added: Array.isArray(parsed.changes?.added)
          ? parsed.changes.added.map(String)
          : [],
        removed: Array.isArray(parsed.changes?.removed)
          ? parsed.changes.removed.map(String)
          : [],
        reorganized: Array.isArray(parsed.changes?.reorganized)
          ? parsed.changes.reorganized.map(String)
          : [],
      },
      explanation:
        (parsed.explanation ?? parsed.reason ?? parsed.rationale ?? "")
          .toString()
          .trim() || null,
    };
  };

  const runRequest = async (extraInstruction = "") => {
    const fullPrompt = extraInstruction ? basePrompt + "\n\n" + extraInstruction : basePrompt;
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.25,
      max_tokens: 2000,
    });
    return response.choices?.[0]?.message?.content?.trim() ?? "";
  };

  try {
    // Primeira tentativa
    let textOut = await runRequest();
    let parsed = parseJsonFromText(textOut);
    let normalized = normalizeParsed(parsed);

    // Verificar contagem de linhas do newResume
    const countLines = (s) =>
      (s || "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0).length;

    let lines = countLines(normalized.newResume);

    if (!normalized.newResume || lines < 20 || lines > 50) {
      // Segunda tentativa reforçando instruções
      const extra = `
ATENÇÃO CRÍTICA:
1) Gere 'newResume' com entre 20 e 50 linhas não vazias.
2) Use plain-text (seções em MAIÚSCULAS, bullets com '-').
3) NÃO invente informações.
4) Apenas JSON como antes.
`;
      try {
        const textOut2 = await runRequest(extra);
        const parsed2 = parseJsonFromText(textOut2);
        const normalized2 = normalizeParsed(parsed2);
        const lines2 = countLines(normalized2.newResume);

        if (normalized2.newResume && lines2 >= 20 && lines2 <= 50) {
          return normalized2;
        }
        if (normalized2.newResume) {
          return normalized2;
        }
      } catch (err2) {
        console.warn("[generateNewResume] Segunda tentativa falhou:", err2);
      }
    }

    return normalized;
  } catch (err) {
    console.error("[generateNewResume] erro:", err);
    return {
      newResume: null,
      changes: { added: [], removed: [], reorganized: [] },
      explanation: null,
    };
  }
}

/**
 * simulateInterview - mantém a função que já estava (com parsing tolerante e fallback)
 */
 async function simulateInterview(resumeText, jobDescription) {
  if (!resumeText?.trim()) return null;
  if (!jobDescription?.trim()) {
    throw new Error("jobDescription é obrigatório para gerar a simulação de entrevista.");
  }
  if (!groq) {
    throw new Error("Groq client não inicializado. Configure GROQ_API_KEY no .env.");
  }

  const fewShot = `
Exemplo 1:
Currículo: Engenheiro de Software com 5 anos em backend Java e AWS.
Vaga: Engenheiro Backend Java.
Saída:
{
  "qa": [
    {
      "pergunta": "Você pode nos contar sobre um desafio que enfrentou ao migrar sistemas para a AWS?",
      "resposta": "Liderei a migração de sistemas críticos para EC2 e RDS, garantindo 99.9% de disponibilidade. O principal desafio foi otimizar custo e latência, e conseguimos reduzir a latência em 30%."
    },
    {
      "pergunta": "Como você lida com prazos apertados?",
      "resposta": "Costumo priorizar entregas com base em impacto, dividir tarefas em sprints curtos e manter alinhamento constante com o time."
    }
  ],
  "questionsForRecruiter": [
    "Como é a cultura de colaboração entre os times?",
    "Quais oportunidades de crescimento existem para essa posição?",
    "Como é estruturado o onboarding para novos colaboradores?"
  ]
}
`;

  const prompt = `
Você é um especialista em recrutamento.
Crie uma simulação de entrevista baseada no CURRÍCULO e na DESCRIÇÃO DA VAGA.

Regras:
- Retorne exatamente JSON válido (somente JSON).
- Estrutura de saída:
{
  "qa": [ { "pergunta": "...", "resposta": "..." }, ... ],
  "questionsForRecruiter": [ "pergunta 1", "pergunta 2", "pergunta 3" ]
}
- Gere 4 perguntas e respostas (técnicas/comportamentais).
- Gere também 3 boas perguntas que o candidato poderia fazer ao recrutador (sobre cultura, carreira, equipe, etc).
- Use chaves simples: "pergunta" e "resposta" OU "question" e "answer".
- Exemplo de guia: ${fewShot}

Vaga:
${jobDescription}

Currículo:
${resumeText}

Resposta (JSON):
{
  "qa": [
    { "pergunta": "...", "resposta": "..." },
    { "pergunta": "...", "resposta": "..." },
    { "pergunta": "...", "resposta": "..." },
    { "pergunta": "...", "resposta": "..." }
  ],
  "questionsForRecruiter": [
    "Pergunta 1",
    "Pergunta 2",
    "Pergunta 3"
  ]
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.45,
      max_tokens: 900,
    });

    let textOut = response.choices?.[0]?.message?.content?.trim() ?? "";
    textOut = textOut.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, "$1").trim();

    try {
      const parsed = JSON.parse(textOut);

      const qa = Array.isArray(parsed.qa)
        ? parsed.qa.map((it) => {
            const q = it.question ?? it.pergunta ?? "";
            const a = it.answer ?? it.resposta ?? "";
            return { question: q.toString().trim(), answer: a.toString().trim() };
          }).filter(p => p.question && p.answer)
        : [];

      // Normaliza as perguntas do entrevistador
      const interviewerQuestions = Array.isArray(parsed.interviewerQuestions)
        ? parsed.interviewerQuestions
        : Array.isArray(parsed.questionsForRecruiter)
        ? parsed.questionsForRecruiter
        : Array.isArray(parsed.perguntasParaEntrevistador)
        ? parsed.perguntasParaEntrevistador
        : [];

      return { qa, interviewerQuestions };

    } catch (parseErr) {
      console.warn("[aiService.simulateInterview] parse JSON falhou:", parseErr?.message || parseErr);
    }

    // fallback simples
    return {
      qa: [
        { question: "Conte-nos sobre sua experiência mais relevante para essa vaga.", answer: "Tenho experiência prática em IA e desenvolvimento de software, com projetos que aplicaram NLP, pipelines e integrações com APIs." },
        { question: "Quais frameworks de NLP/LLM você já utilizou?", answer: "Trabalhei com LangChain, Hugging Face, TensorFlow e PyTorch em projetos de POCs e produção." },
        { question: "Como você entrega valor imediato em projetos de IA?", answer: "Priorizo entregar experimentos que validem hipóteses com dados reais, automatizando rotinas e integrando modelos ao fluxo de negócio." }
      ],
      interviewerQuestions: [
        "Como a empresa apoia o desenvolvimento de carreira?",
        "Quais são os principais desafios dessa equipe?",
        "Como é a cultura de feedback dentro da organização?"
      ]
    };
  } catch (err) {
    console.error("[aiService.simulateInterview] erro:", err);
    return { qa: [], interviewerQuestions: [] };
  }
}


module.exports = {
  generateResumeSummary,
  generateOptimizedResume,
  generateCoverLetter,
  generateNewResume,
  simulateInterview,
};