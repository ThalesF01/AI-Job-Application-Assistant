import express from "express";
import cors from "cors";
import jobApplicationsRoutes from "./routes/jobApplications.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// SOLUÇÃO MAIS DIRETA: usar array simples
const allowedOrigins = [
  "https://aijobapplicationassistant.vercel.app",
  "https://aijobapplicationassistant.vercel.app/", // com barra também
  "https://otimizador-curriculo-h31lhff9x-thalesf01s-projects.vercel.app",
  "https://otimizador-curriculo-h31lhff9x-thalesf01s-projects.vercel.app/",
  "http://localhost:3000",
  "http://localhost:3000/"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Middleware alternativo manual para casos extremos
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log("=== REQUEST DEBUG ===");
  console.log("Method:", req.method);
  console.log("Origin:", origin);
  console.log("Path:", req.path);
  
  // Se for uma requisição OPTIONS (preflight), responder manualmente
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request manually");
    res.header('Access-Control-Allow-Origin', origin?.replace(/\/$/, '') || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/applications", jobApplicationsRoutes);
app.use("/api/ai", aiRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

export default app;