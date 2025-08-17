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
Seu objetivo é gerar um resumo profissional de 5 a 10 linhas, claro e conciso.
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

export async function generateOptimizedResume(resumeText, jobDescription) {
  if (!resumeText || !resumeText.trim()) return null;
  if (!jobDescription || !jobDescription.trim()) {
    throw new Error("jobDescription é obrigatório para otimização.");
  }
  if (!groq) {
    throw new Error("Groq client não inicializado. Configure GROQ_API_KEY no .env.");
  }

  // Few-shot / exemplos curtos para guiar estilo (poucos exemplos para economizar tokens)
  const fewShot = `

Exemplo 1:
Currículo: Nome: Carlos Pereira
Resumo: Engenheiro de Software com 6 anos de experiência em backend, arquitetura de microsserviços e cloud. Forte atuação em Java (Spring Boot), AWS (EC2, RDS, SQS), bancos relacionais e message brokers. Liderou migração de monólito para microsserviços e implementação de APIs de alta disponibilidade.

Skills: Java, Spring Boot, REST APIs, Docker, Kubernetes (EKS), AWS (EC2, RDS, SQS, CloudWatch), PostgreSQL, Redis, CI/CD (Jenkins, GitHub Actions), Observability, performance tuning.

Experiência:
- Empresa Alpha (2020–Presente) — Engenheiro Backend
  - Liderou migração de monolito Java para microsserviços com Spring Boot; projetou APIs e contratos; reduziu latência média em 30% e melhorou escalabilidade.
  - Implementou filas com SQS e caching com Redis, resultando em 40% de redução de chamadas ao banco.
  - Automatizou deploys com GitHub Actions e monitoramento via CloudWatch + Prometheus.

- Empresa Beta (2017–2020) — Desenvolvedor Backend
  - Desenvolveu serviços REST e integração com gateways de pagamento; projetou schemas PostgreSQL e otimizações de queries.
  - Responsável por testes automatizados e pipelines CI.

Formação: Bacharel em Ciência da Computação — Universidade XYZ (2017)

Vaga: Engenheiro Backend (Java/AWS)
Requisitos: Java 8+, Spring Boot, microservices, AWS (EC2, RDS, SQS), experiência com APIs de alta carga, Docker/Kubernetes, observability e automação CI/CD. Desejável experiência em arquitetura e reduções de latência.

Otimização: ## Resumo Profissional
Engenheiro de Software com 6 anos de experiência focada em backend e arquitetura de microsserviços. Especialista em Java (Spring Boot) e soluções cloud-native na AWS (EC2, RDS, SQS), com histórico comprovado de melhoria de performance e confiabilidade — liderou migração que reduziu latência em 30% e implementou padrões de escalabilidade e observability para produção. Experiência em automação de CI/CD, contêineres (Docker, Kubernetes) e otimização de acesso a dados.

## Skills Principais
- Linguagens / Frameworks: Java (Spring Boot), REST APIs  
- Cloud / Infra: AWS (EC2, RDS, SQS, CloudWatch)  
- Contêineres & Orquestração: Docker, Kubernetes (EKS)  
- Dados & Cache: PostgreSQL, Redis  
- DevOps / Observability: GitHub Actions / Jenkins, Prometheus, CloudWatch  
- Arquitetura: Microsserviços, filas, design de API, performance tuning

## Experiências Relevantes
- **Engenheiro Backend — Empresa Alpha (2020–Presente)**  
  - Liderou projeto de decomposição do monólito para microsserviços em Spring Boot, definindo contratos de API e estratégia de versionamento.  
  - Projetou e implementou integração assíncrona com SQS e cache Redis, reduzindo carga no banco e melhorando throughput em 40%.  
  - Otimizou pipelines de CI/CD (GitHub Actions), reduzindo tempo de entrega e aumentando frequência de deploys.  
  - Implantou observability com CloudWatch e Prometheus, definindo SLIs/SLOs e alertas que diminuíram tempo médio de detecção de incidentes.

- **Desenvolvedor Backend — Empresa Beta (2017–2020)**  
  - Desenvolveu APIs REST resilientes e otimizou queries em PostgreSQL para reduzir latência de endpoints críticos.  
  - Implementou testes automatizados e práticas de integração contínua, melhorando qualidade do código entregue.

## Formação
- Bacharel em Ciência da Computação — Universidade XYZ


Exemplo 2:
Currículo: THALES FISCUS — Desenvolvedor de Inteligência Artificial
Resumo: Profissional de Tecnologia com foco em IA aplicada, NLP e soluções generativas. Experiência em Python, TensorFlow, PyTorch, LangChain, Hugging Face, RAG, embeddings, e integração de LLMs em produtos. Projetos com pipelines de NLP, chatbots e automações.

Skills: Python, TensorFlow, PyTorch, LangChain, Hugging Face, embeddings, RAG, NLP, Docker, AWS, Next.js, Node.js, SQL, Git.

Experiência:
- Mastercoin Comércio e Serviços (09/2023 – Presente) — Analista de Sistemas
  - Desenvolvimento de automações internas e integrações com APIs; participou da implementação de um chatbot para atendimento interno.
- Yduqs (02/2022 – 12/2022) — Analista de Dados
  - Construiu pipelines de NLP que reduziram em 40% o tempo de processamento de análises; integrou modelos de linguagem para extração de insights.
- Projetos: Chatbot Inteligente (RAG + embeddings) para atendimento; Rede neural para cálculos matemáticos.

Formação:
- Pós-graduação (em andamento) em Inteligência Artificial
- Tecnólogo em Análise e Desenvolvimento de Sistemas

Vaga: Especialista em IA Conversacional — Simbium
Resumo: Procuramos especialista em IA conversacional com sólida experiência em Python e integração de LLMs/Libraries (LangChain, Hugging Face). Responsabilidades incluem desenvolver assistentes virtuais, pipelines de NLP, integrações API e arquitetura escalável para chatbots no nicho fitness.
Requisitos: experiência com NLP, embeddings, LangChain, integração de APIs, deploy em cloud (AWS), versionamento Git.

Otimização: ## Resumo Profissional
Especialista em Inteligência Artificial com experiência prática em desenvolvimento e integração de soluções conversacionais. Forte domínio em Python, NLP e frameworks como LangChain e Hugging Face para implementar arquiteturas RAG e pipelines de embeddings. Entrego assistentes virtuais escaláveis e automações que conectam LLMs a sistemas de produção, com foco em redução de latência e melhoria da qualidade de resposta.

## Skills Principais
- Linguagens & ML: Python, TensorFlow, PyTorch  
- Conversational AI: LangChain, Hugging Face, RAG, embeddings  
- Infra & Deploy: AWS (EC2, S3), Docker, CI/CD  
- Dados & Pipelines: ETL para texto, pré-processamento, vetorização, indexação  
- Integrações: APIs REST, Webhooks, banco relacional/noSQL  
- Metodologias: MLOps básico, testes de modelos, monitoramento de qualidade de resposta

## Experiências Relevantes
- **Projeto: Chatbot Inteligente (RAG + Embeddings)**  
  - Projetou e implementou pipeline de recuperação+geração usando embeddings e vector store, melhorando relevância das respostas e reduzindo fallback para respostas genéricas.  
  - Integrado com APIs externas e fluxos de negócio para personalização de interações.

- **Analista de Dados — Yduqs (02/2022–12/2022)**  
  - Desenvolveu pipelines de NLP para pré-processamento e ingestão de dados textuais; reduziu o tempo de análise em 40% através de automação e vectorização.  
  - Validou e fine-tunou modelos para tarefas de extração e classificação de intenções.

- **Analista de Sistemas — Mastercoin (09/2023–Presente)**  
  - Participou da implementação de automações e de um protótipo de chatbot interno, integrando pipelines de dados com serviços backend e monitoramento.

## Formação
- Pós-graduação em Inteligência Artificial — (em andamento)  
- Tecnólogo em Análise e Desenvolvimento de Sistemas


Exemplo 3:
Currículo: Nome: Mariana Souza
Resumo: Engenheira de Machine Learning com 5 anos de atuação em produção de modelos, CI/CD para ML, orquestração de pipelines e implantação de modelos em nuvem. Experiência com AWS (SageMaker), Kubernetes, Docker, Airflow, monitoring, e práticas de MLOps para garantir reprodutibilidade e observability.

Skills: Python, ML Pipelines, Docker, Kubernetes, Airflow, Terraform, AWS (SageMaker, S3, ECR), Prometheus, Grafana, model monitoring, data validation (Great Expectations).

Experiência:
- Empresa Gamma (2021–Presente) — MLOps Engineer
  - Implementou pipelines com Airflow para pipelines ETL e treinamento; automatizou deploy em SageMaker e Kubernetes, reduzindo tempo de entrega de modelos de semanas para dias.
  - Introduziu testes de dados e validação, evitando regressões de performance.

- Empresa Delta (2018–2021) — Data Scientist
  - Projetou modelos de recomendação e pipelines de inferência batch/online.

Formação: Mestrado em Ciência de Dados — Universidade ABC (2018)

Vaga: MLOps Engineer / Machine Learning Engineer
Requisitos: Experiência com orchestration (Airflow), deploy de modelos (SageMaker/K8s), infra como código (Terraform), monitoramento de modelos e pipelines reprodutíveis. Conhecimento em Python, Docker, Kubernetes, CI/CD.

Otimização: ## Resumo Profissional
Engenheira de MLOps com 5 anos de experiência em construir e operacionalizar pipelines de machine learning de ponta a ponta. Especialista em automação de treinamentos e deploys (Airflow, SageMaker, Kubernetes), validação de dados e monitoramento de modelos em produção. Já reduziu tempo de entrega de modelos de semanas para dias por meio de CI/CD para ML e infraestrutura como código.

## Skills Principais
- Ferramentas & Orquestração: Airflow, Terraform, Jenkins/GitHub Actions  
- Deploy & Infra: AWS SageMaker, Kubernetes, Docker, ECR, S3  
- Observability: Prometheus, Grafana, model monitoring, logging estruturado  
- ML & Data: Python, scikit-learn, pipelines de inferência batch/online, validação de dados (Great Expectations)

## Experiências Relevantes
- **MLOps Engineer — Empresa Gamma (2021–Presente)**  
  - Projetou e implementou pipelines de treinamento e inferência com Airflow e SageMaker, reduzindo tempo de modelagem e deploy de semanas para dias.  
  - Automatizou deploys canary em Kubernetes, monitoramento de performance de modelos e alertas de drift.  
  - Implementou testes automatizados de dados e modelos, evitando regressões e garantindo reprodutibilidade.

- **Data Scientist — Empresa Delta (2018–2021)**  
  - Desenvolveu e redesenhou pipelines de feature engineering para modelos de recomendação; otimizou inferência online para latência consistente.

## Formação
- Mestrado em Ciência de Dados — Universidade ABC
`;


  // Prompt / instruções para reescrever o currículo
  const prompt = `
Você é um redator técnico especializado em reescrever currículos para maximizar aderência a uma descrição de vaga.
Regras:
- Receba o CURRÍCULO (texto) e a DESCRIÇÃO DA VAGA.
- Produza um currículo reescrito (trechos e bullets) que realce skills, tecnologias e resultados que combinam com a vaga.
- NÃO inclua contatos (telefone, email) ou links.
- Baseado na vaga, avalie o que é relevante e o que pode ser omitido no currículo.
- Use Markdown para estruturar seções: ## Resumo Profissional, ## Skills Principais
- Use bullets para experiências relevantes, destacando resultados e tecnologias.
- Mantenha o estilo profissional e objetivo.
- Mantenha veracidade: não invente experiências; reorganize e destaque o que já existe no currículo.
- Priorize palavras-chave da vaga.
- Resultado em Markdown, com seções curtas (Resumo, Skills principais, Experiências Relevantes - bullets).
- Seja objetivo: 20-50 linhas no resumo e bullets claros.
- O currículo otimizado deve ser parecido em tamanho com o original, mas mais focado na vaga.
- Separe bem cada seção com títulos em Markdown.
- Exemplo de guia (não copie literalmente): ${fewShot}

Vaga:
${jobDescription}

Currículo (texto extraído):
${resumeText}

Currículo otimizado (Markdown):
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192", // ajuste se quiser outro modelo
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2, // mais objetivo
      max_tokens: 1700, // suficiente para output em Markdown
    });

    const optimized = response.choices?.[0]?.message?.content?.trim() ?? null;
    return optimized;
  } catch (err) {
    console.error("[aiService.generateOptimizedResume] erro:", err);
    return null;
  }
}

export async function generateCoverLetter(resumeText, jobDescription) {
  if (!resumeText || !resumeText.trim()) return null;
  if (!jobDescription || !jobDescription.trim()) {
    throw new Error("jobDescription é obrigatório para gerar a carta de apresentação.");
  }
  if (!groq) {
    throw new Error("Groq client não inicializado. Configure GROQ_API_KEY no .env.");
  }

  // Exemplo simples de carta para guiar o estilo (few-shot)
  const fewShot = `
Exemplo 1:
Currículo: Engenheiro de Software com 5 anos em backend Java, AWS (EC2, RDS),  projetos de alta disponibilidade.
Vaga: Engenheiro Backend (Java, AWS, microservices).
Carta de Apresentação: Prezados recrutadores, é com grande entusiasmo que me candidato à vaga de Engenheiro Backend. Tenho 5 anos de experiência em Java e AWS, liderei a migração de sistemas críticos para cloud, obtendo redução de 30% na latência. Estou motivado para aplicar minhas habilidades em arquiteturas escaláveis e APIs resilientes, alinhando tecnologia a impacto de negócio. Acredito que minha experiência poderá agregar muito valor à sua equipe.
  
Exemplo 2:
Currículo: Analista de Sistemas e Desenvolvedor de Inteligência Artificial, com experiência em Python, TensorFlow, PyTorch, LangChain e Hugging Face. Atuei em integrações com APIs, bancos de dados SQL, cloud (AWS) e desenvolvimento de pipelines de NLP, otimizando em 40% o tempo de análise de dados. Pós-graduação em Inteligência Artificial em andamento.
Vaga: Especialista em IA Conversacional (Simbium) — Foco em desenvolvimento de assistentes virtuais inteligentes para o nicho fitness, utilizando NLP, LLMs e arquiteturas escaláveis para automação e retenção de clientes.
Carta de Apresentação: Prezados recrutadores da Simbium, é com entusiasmo que me candidato à vaga de Especialista em IA Conversacional. Tenho sólida experiência em desenvolvimento de soluções de NLP e integração de LLMs, aplicando frameworks como TensorFlow, PyTorch, LangChain e Hugging Face. Em um dos meus projetos, otimizei pipelines de NLP que reduziram em 40% o tempo de análise de dados, demonstrando minha capacidade de alinhar inovação tecnológica a resultados reais. Estou motivado a aplicar meu conhecimento em IA para construir assistentes virtuais inteligentes que fortaleçam a experiência dos clientes da Simbium. Acredito que minhas competências técnicas e visão estratégica poderão agregar muito valor à sua equipe.
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
      temperature: 0.4, // equilibrado: não tão frio, não tão criativo
      max_tokens: 800,
    });

    const coverLetter = response.choices?.[0]?.message?.content?.trim() ?? null;
    return coverLetter;
  } catch (err) {
    console.error("[aiService.generateCoverLetter] erro:", err);
    return null;
  }
}

export async function simulateInterview(resumeText, jobDescription) {
  if (!resumeText || !resumeText.trim()) return null;
  if (!jobDescription || !jobDescription.trim()) {
    throw new Error("jobDescription é obrigatório para gerar a simulação de entrevista.");
  }
  if (!groq) {
    throw new Error("Groq client não inicializado. Configure GROQ_API_KEY no .env.");
  }

  const fewShot = `
Exemplo 1:
Currículo: Engenheiro de Software com 5 anos em backend Java e AWS.
Vaga: Engenheiro Backend Java.
Entrevista:
[
  {
    "pergunta": "Você pode nos contar sobre um desafio que enfrentou ao migrar sistemas para a AWS?",
    "resposta": "Liderei a migração de sistemas críticos para EC2 e RDS, garantindo 99.9% de disponibilidade. O principal desafio foi otimizar custo e latência, e conseguimos reduzir a latência em 30%."
  },
  {
    "pergunta": "Como você lida com prazos apertados?",
    "resposta": "Costumo priorizar entregas com base em impacto, dividir tarefas em sprints curtos e manter alinhamento constante com o time."
  }
]

Exemplo 2:
Currículo: Analista de Sistemas especializado em Inteligência Artificial, Python, TensorFlow, PyTorch, LangChain e Hugging Face.
Vaga: Especialista em IA Conversacional.
Entrevista:
[
  {
    "pergunta": "Qual sua experiência com NLP e integração de LLMs?",
    "resposta": "Já desenvolvi pipelines de NLP com TensorFlow e PyTorch, além de aplicar LangChain e Hugging Face para integrar modelos conversacionais, otimizando em 40% o tempo de análise de dados."
  },
  {
    "pergunta": "Como você aplicaria IA para melhorar assistentes virtuais no nicho fitness?",
    "resposta": "Implementaria agentes conversacionais personalizados com LLMs, capazes de recomendar treinos e nutrição, mantendo engajamento e retenção de clientes."
  }
]
`;

  const prompt = `
Você é um especialista em recrutamento.
Crie uma simulação de entrevista (3 perguntas) baseada no CURRÍCULO e na DESCRIÇÃO DA VAGA.

Regras:
- Retorne exatamente JSON válido (somente JSON).
- Gere 3 perguntas (técnicas/comportamentais).
- Para cada pergunta gere uma resposta plausível baseada no currículo.
- Use chaves simples: "pergunta" e "resposta" OU "question" e "answer".
- Exemplo de guia: ${fewShot}

Vaga:
${jobDescription}

Currículo:
${resumeText}

Resposta (JSON):
[
  { "pergunta": "...", "resposta": "..." },
  { "pergunta": "...", "resposta": "..." },
  { "pergunta": "...", "resposta": "..." }
]
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.45,
      max_tokens: 700,
    });

    let textOut = response.choices?.[0]?.message?.content?.trim() ?? "";

    // 1) limpar blocos Markdown, triple backticks, texto adicional
    // extrai primeiro bloco JSON encontrado (entre colchetes)
    const jsonMatch = textOut.match(/\[([\s\S]*?)\]/m);
    let jsonText = jsonMatch ? `[${jsonMatch[1]}]` : textOut;

    // remover possíveis ```json ... ``` ou ``` ... ```
    jsonText = jsonText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, "$1").trim();

    // tentar parse
    try {
      const parsed = JSON.parse(jsonText);

      // normalize keys: aceita "pergunta"/"resposta" ou "question"/"answer"
      const normalized = Array.isArray(parsed)
        ? parsed.map((it) => {
            const q = it.question ?? it.pergunta ?? it.q ?? "";
            const a = it.answer ?? it.resposta ?? it.a ?? "";
            return { question: (q || "").toString().trim(), answer: (a || "").toString().trim() };
          }).filter(p => p.question && p.answer)
        : [];

      if (normalized.length > 0) return normalized;
      // se parse funcionou mas resultado vazio, cair no fallback
    } catch (parseErr) {
      // parsing falhou — vamos tentar extrair linhas "Pergunta:" / "Resposta:" como fallback
      // não quebra, passaremos para o fallback mock
      console.warn("[aiService.simulateInterview] parse JSON falhou:", parseErr?.message || parseErr);
    }

    // fallback: tentar extrair pares com regex (pergunta/resposta)
    const pairs = [];
    const pairRegex = /(pergunta|question)\s*[:\-]\s*["']?([^"\n\r]+)["']?[\s\S]*?(resposta|answer)\s*[:\-]\s*["']?([^"\n\r]+)["']?/gi;
    let m;
    while ((m = pairRegex.exec(textOut)) !== null) {
      pairs.push({ question: m[2].trim(), answer: m[4].trim() });
      if (pairs.length >= 3) break;
    }
    if (pairs.length > 0) return pairs;

    // último recurso: mock pequeno (para UX quando a IA falhar)
    return [
      { question: "Conte-nos sobre sua experiência mais relevante para essa vaga.", answer: "Tenho experiência prática em IA e desenvolvimento de software, com projetos que aplicaram NLP, pipelines e integrações com APIs." },
      { question: "Quais frameworks de NLP/LLM você já utilizou?", answer: "Trabalhei com LangChain, Hugging Face, TensorFlow e PyTorch em projetos de POCs e produção." },
      { question: "Como você entrega valor imediato em projetos de IA?", answer: "Priorizo entregar experimentos que validem hipóteses com dados reais, automatizando rotinas e integrando modelos ao fluxo de negócio." }
    ];
  } catch (err) {
    console.error("[aiService.simulateInterview] erro:", err);
    // quando Groq falhar, retornar mock para não quebrar frontend
    return [
      { question: "Conte-nos sobre sua experiência mais relevante para essa vaga.", answer: "Tenho experiência prática em IA e desenvolvimento de software, com projetos que aplicaram NLP, pipelines e integrações com APIs." },
      { question: "Quais frameworks de NLP/LLM você já utilizou?", answer: "Trabalhei com LangChain, Hugging Face, TensorFlow e PyTorch em projetos de POCs e produção." },
      { question: "Como você entrega valor imediato em projetos de IA?", answer: "Priorizo entregar experimentos que validem hipóteses com dados reais, automatizando rotinas e integrando modelos ao fluxo de negócio." }
    ];
  }
}