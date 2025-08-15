// src/controllers/applicationsController.js
import path from "path";
import fs from "fs";
import { uploadFile } from "../services/s3Service.js";
import { saveApplication } from "../services/dynamoService.js";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

export const createApplication = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    // Gere id e nome de arquivo
    const id = Date.now().toString();
    const originalName = req.file.originalname;
    const key = `${id}_${originalName}`;

    // opcional: salvar localmente para debug
    const localPath = path.join(uploadsDir, key);
    fs.writeFileSync(localPath, req.file.buffer);
    console.log("Arquivo salvo localmente em:", localPath);

    // envia ao S3
    const s3Res = await uploadFile(req.file.buffer, key, req.file.mimetype);
    console.log("Arquivo enviado ao S3:", s3Res);

    // cria objeto para salvar no DynamoDB
    const application = {
      id,
      resumeUrl: s3Res.Location,
      originalName,
      createdAt: new Date().toISOString(),
    };

    await saveApplication(application);

    // retorno compatível com frontend
    return res.status(201).json({ message: "Aplicação salva", resume_id: id, application });
  } catch (err) {
    console.error("Erro no createApplication:", err);
    return res.status(500).json({ error: "Erro interno", details: err.message || String(err) });
  }
};

export const parseApplication = (req, res) => {
  const { id } = req.params;

  // exemplo de resposta em mesmo shape que o frontend espera
  res.json({
    parsed: {
      name: "Mock Name",
      email: "mock@email.com",
      skills: ["JavaScript", "Node.js"]
    }
  });
};
