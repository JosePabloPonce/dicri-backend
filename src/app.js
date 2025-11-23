// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getPool } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import expedientesRoutes from "./routes/expedientes.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";
import { requireAuth } from "./middlewares/auth.middleware.js";
import { swaggerUi, swaggerDocument } from "./swagger.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT 1 AS ok");
    res.json({ status: "ok", db: result.recordset[0].ok });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: "DB connection failed" });
  }
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRoutes);

app.use("/api/expedientes", requireAuth, expedientesRoutes);
app.use("/api/reportes", requireAuth, reportesRoutes);

export default app;
