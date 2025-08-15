// server.js (raiz)
import express from "express";
import cors from "cors";
import jobApplicationsRoutes from "./src/routes/jobApplications.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/applications", jobApplicationsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`));
