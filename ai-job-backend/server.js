// server.js
import dotenv from "dotenv";
dotenv.config(); // ⚠️ precisa estar no topo

import express from "express";
import cors from "cors"; // <-- importar cors
import jobApplicationsRoutes from "./src/routes/jobApplications.js";

const app = express();

// Configurar CORS
app.use(cors({
  origin: "http://localhost:3000", // permite apenas o frontend Next.js
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Rotas
app.use("/api/applications", jobApplicationsRoutes);

// teste se HF_API_KEY está carregado
console.log("HF_API_KEY =", process.env.HF_API_KEY ? "OK" : "Não configurado");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
