// server.js
import dotenv from "dotenv";
dotenv.config(); // precisa estar no topo

import express from "express";
import cors from "cors";
import morgan from "morgan";

import jobApplicationsRoutes from "./src/routes/jobApplications.js";
import aiRoutes from "./src/routes/aiRoutes.js";

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS: permitir frontend Next.js em dev. Ajuste origin em produção.
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Rotas
app.use("/api/applications", jobApplicationsRoutes);
app.use("/api/ai", aiRoutes);

// Health
app.get("/healthz", (req, res) => res.json({ ok: true }));

// Log de variáveis importantes para debug (não mostre chaves secretas)
console.log("HF_API_KEY =", process.env.HF_API_KEY ? "OK" : "Não configurado");
console.log("GROQ_API_KEY =", process.env.GROQ_API_KEY ? "OK" : "Não configurado");
console.log("AI_SERVICE_URL =", process.env.AI_SERVICE_URL || "http://localhost:8000");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
