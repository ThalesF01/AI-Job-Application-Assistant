import { uploadFile } from "../services/s3Service.js";
import { saveApplication, getApplicationById } from "../services/dynamoService.js";

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
