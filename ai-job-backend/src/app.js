// app.js
import express from "express";
import cors from "cors";
import jobApplicationsRoutes from "./routes/jobApplications.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// Habilita CORS para permitir o front-end do localhost
app.use(cors({
  origin: "https://aijobapplicationassistant.vercel.app/", // endereço do seu Next.js
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