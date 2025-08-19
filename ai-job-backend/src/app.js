import express from "express";
import cors from "cors";
import jobApplicationsRoutes from "./routes/jobApplications.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// Lista de origens permitidas
const allowedOrigins = [
  "https://aijobapplicationassistant.vercel.app",
  "https://otimizador-curriculo-h31lhff9x-thalesf01s-projects.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // server-side requests
    // remove barra final se existir
    const cleanedOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(cleanedOrigin)) {
      return callback(null, true);
    }
    console.log("CORS bloqueado para origem:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/applications", jobApplicationsRoutes);
app.use("/api/ai", aiRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

export default app;
