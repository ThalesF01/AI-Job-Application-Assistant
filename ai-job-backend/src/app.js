// app.js - Versão CommonJS para Lambda
const express = require("express");
const cors = require("cors");
const jobApplicationsRoutes = require("./routes/jobApplications.js");
const aiRoutes = require("./routes/aiRoutes.js");

const app = express();

// CORS para desenvolvimento e produção
app.use(cors({
  origin: [
    "http://localhost:3000", // desenvolvimento
    "https://main.d1gm9513m1780w.amplifyapp.com" // produção
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rotas
app.use("/api/applications", jobApplicationsRoutes);
app.use("/api/ai", aiRoutes);

// --- Health Check para ALB ---
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Rota de teste adicional
app.get("/", (req, res) => {
  res.json({ 
    message: "Backend funcionando!",
    timestamp: new Date().toISOString()
  });
});

module.exports = app;