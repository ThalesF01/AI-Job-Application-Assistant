import { uploadFile } from "../services/s3Service.js";
import { saveApplication, getApplicationById } from "../services/dynamoService.js";
import { generateOptimizedResume } from "../services/aiService.js"; // função que chama Groq

export const createApplication = async (req, res) => {
  try {
    const { name, email } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Arquivo de currículo é obrigatório." });
    }

    const fileName = `${Date.now()}_${file.originalname}`;
    const s3Result = await uploadFile(file.buffer, fileName, file.mimetype);

    const id = Date.now().toString();
    const application = {
      id,
      name,
      email,
      resumeUrl: s3Result.Location,
      createdAt: new Date().toISOString(),
    };

    await saveApplication(application);

    res.status(201).json({ 
      message: "Aplicação enviada com sucesso!", 
      id: application.id, // envia o ID para o frontend usar
      application 
    });
  } catch (error) {
    console.error("Erro no createApplication:", error);
    res.status(500).json({ error: "Erro ao enviar aplicação.", details: error.message });
  }
};

export const parseApplication = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Resume ID recebido para parse:", id);

    // Aqui você buscaria os dados no DynamoDB ou no S3
    const application = await getApplicationById(id);

    if (!application) {
      return res.status(404).json({ error: "Aplicação não encontrada" });
    }

    // Aqui vai a lógica para realmente "parsear" o currículo
    // (ex: chamar OpenAI, extração de texto, etc.)
    const parsedData = {
      name: application.name,
      email: application.email,
      extractedSkills: ["JavaScript", "Node.js", "AWS"], // exemplo
    };

    res.json({ parsedData });
  } catch (error) {
    console.error("Erro no parseApplication:", error);
    res.status(500).json({ error: "Erro ao processar currículo", details: error.message });
  }
};

export const generateOptimizedResume = async (req, res) => {
  try {
    const { resume_id, resumeText, job_description } = req.body;
    if (!resumeText || !job_description) {
      return res.status(400).json({ error: "resumeText e job_description são obrigatórios" });
    }

    let optimizedText = null;

    // 1) Tentar Groq AI
    if (process.env.GROQ_API_KEY) {
      try {
        optimizedText = await generateOptimizedResume(resumeText, job_description);
      } catch (err) {
        console.warn("[generateOptimizedResume] Groq falhou:", err.message || err);
      }
    }

    // 2) Fallback: FastAPI
    if (!optimizedText) {
      const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
      const aiRes = await axios.post(`${AI_SERVICE_URL}/optimize`, { resumeText, jobDescription: job_description });
      optimizedText = aiRes?.data?.optimizedResumeMarkdown ?? "";
    }

    return res.json({ optimizedResumeMarkdown: optimizedText });
  } catch (err) {
    console.error("[generateOptimizedResume] erro:", err);
    return res.status(500).json({ error: "Erro interno ao otimizar currículo" });
  }
};