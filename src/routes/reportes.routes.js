import { Router } from "express";
import { getPool } from "../db.js";

const router = Router();

// GET /api/ para obtener reportes
router.get("/", async (req, res) => {
  const { fechaInicio, fechaFin, estado } = req.query;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("fechaInicio", fechaInicio || null)
      .input("fechaFin", fechaFin || null)
      .input("estado", estado || null)
      .execute("sp_Reportes_Expedientes");

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener reportes" });
  }
});

export default router;
