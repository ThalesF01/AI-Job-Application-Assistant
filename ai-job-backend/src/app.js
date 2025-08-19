import express from "express";
import cors from "cors";
import jobApplicationsRoutes from "./routes/jobApplications.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// Lista de origens permitidas (todas sem barra final)
const allowedOrigins = [
  "https://aijobapplicationassistant.vercel.app",
  "https://otimizador-curriculo-h31lhff9x-thalesf01s-projects.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origin (ex: aplicativos móveis, Postman)
    if (!origin) return callback(null, true);
    
    // Remover barra final se existir
    const cleanedOrigin = origin.replace(/\/$/, "");
    
    // Verificar se a origem está na lista permitida
    if (allowedOrigins.includes(cleanedOrigin)) {
      console.log("CORS permitido para origem:", cleanedOrigin);
      return callback(null, true);
    }
    
    console.log("CORS bloqueado para origem:", origin);
    console.log("Origem limpa:", cleanedOrigin);
    console.log("Origens permitidas:", allowedOrigins);
    
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para logs de debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
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