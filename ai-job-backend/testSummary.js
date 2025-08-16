import { generateResumeSummary } from "./src/services/aiService.js";

async function teste() {
  const exemploCurriculo = `
THALES FISCUS
📍 Rio de Janeiro – RJ
💻 github.com/ThalesF01
📞 (21) 97455-5406
✉️ thalesgabriel07@gmail.com

DESENVOLVEDOR DE INTELIGÊNCIA ARTIFICIAL
Profissional de Tecnologia com foco em Inteligência Artificial, formação em Análise e Desenvolvimento de Sistemas e pós-graduação em IA em andamento.
Experiência em projetos com Python, Node.js, integração de APIs, cloud AWS (S3, Lambda) e machine learning.
Habilidades: Python, JavaScript, TensorFlow, PyTorch, LangChain, Hugging Face.
`;

  const resumo = await generateResumeSummary(exemploCurriculo);
  console.log("Resumo gerado:", resumo);
}

teste();
