// app.js
import express from "express";
import cors from "cors";
import jobApplicationsRoutes from "./routes/jobApplications.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// Habilita CORS para permitir o front-end do localhost
const allowedOrigins = [
  "https://aijobapplicationassistant.vercel.app",
  "https://otimizador-curriculo-h31lhff9x-thalesf01s-projects.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function(origin, callback){
    if (!origin) return callback(null, true); // permite chamadas do server-side
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  }
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

export default app;