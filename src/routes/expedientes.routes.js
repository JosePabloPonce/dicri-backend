import { Router } from "express";
import { getPool } from "../db.js";
import { requireRol } from "../middlewares/roles.middleware.js";

const router = Router();

// GET /api/expedientes  -> lista
router.get("/", requireRol(["TECNICO", "COORDINADOR"]), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("sp_Expedientes_Listar");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al listar expedientes" });
  }
});

// GET /api/expedientes/:id -> detalle + indicios
router.get("/:id", requireRol(["TECNICO", "COORDINADOR"]), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", req.params.id)
      .execute("sp_Expedientes_Obtener");

    res.json({
      expediente: result.recordsets[0][0],
      indicios: result.recordsets[1],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener expediente" });
  }
});

// POST /api/expedientes -> crear expediente - solo TECNICO
router.post("/", requireRol(["TECNICO"]), async (req, res) => {
  const { codigo, fechaRegistro } = req.body;

  try {
    const pool = await getPool();

    const tecnicoId = req.user.userId;

    const result = await pool
      .request()
      .input("codigo", codigo)
      .input("fechaRegistro", fechaRegistro)
      .input("tecnicoId", tecnicoId)
      .execute("sp_Expedientes_Crear");

    res.status(201).json({ id: result.recordset[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear expediente" });
  }
});

// POST /api/expedientes/:id/estado -> cambiar estado
router.post("/:id/estado", async (req, res) => {
  const { nuevoEstado, justificacionRechazo } = req.body;

  try {
    const pool = await getPool();

    const rol = req.user?.rolNombre || "";

    if (nuevoEstado === "EN_REVISION") {
      if (rol !== "TECNICO") {
        return res
          .status(403)
          .json({ message: "Solo el técnico puede enviar a revisión." });
      }
    }

    if (nuevoEstado === "APROBADO" || nuevoEstado === "RECHAZADO") {
      if (rol !== "COORDINADOR") {
        return res
          .status(403)
          .json({ message: "Solo el coordinador puede aprobar o rechazar." });
      }
    }

    if (nuevoEstado === "RECHAZADO" && !justificacionRechazo?.trim()) {
      return res
        .status(400)
        .json({ message: "Debe ingresar una justificación para rechazar." });
    }

    await pool
      .request()
      .input("id", req.params.id)
      .input("nuevoEstado", nuevoEstado)
      .input("justificacionRechazo", justificacionRechazo || null)
      .execute("sp_Expedientes_CambiarEstado");

    res.json({ message: "Estado actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
});

// POST /api/expedientes/:id/indicios -> Agregar indicio -> solo TECNICO (cuando estado permita)
router.post("/:id/indicios", requireRol(["TECNICO"]), async (req, res) => {
  const { descripcion, color, tamano, peso, ubicacion, tecnicoId } = req.body;

  try {
    const pool = await getPool();
    const tecnicoId = req.user.userId;

    await pool
      .request()
      .input("expedienteId", req.params.id)
      .input("descripcion", descripcion)
      .input("color", color || null)
      .input("tamano", tamano || null)
      .input("peso", peso || null)
      .input("ubicacion", ubicacion || null)
      .input("tecnicoId", tecnicoId)
      .execute("sp_Indicios_Agregar");

    res.status(201).json({ message: "Indicio agregado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al agregar indicio" });
  }
});

// PUT /api/expedientes/:id/indicios/:indicioId -> actualizar indicio
router.put(
  "/:id/indicios/:indicioId",
  requireRol(["TECNICO"]),
  async (req, res) => {
    const { descripcion, color, tamano, peso, ubicacion } = req.body;

    try {
      const pool = await getPool();
      await pool
        .request()
        .input("id", req.params.indicioId)
        .input("descripcion", descripcion)
        .input("color", color || null)
        .input("tamano", tamano || null)
        .input("peso", peso || null)
        .input("ubicacion", ubicacion || null)
        .execute("sp_Indicios_Actualizar");

      res.json({ message: "Indicio actualizado" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al actualizar indicio" });
    }
  }
);

// DELETE /api/expedientes/:id/indicios/:indicioId -> eliminar indicio
router.delete(
  "/:id/indicios/:indicioId",
  requireRol(["TECNICO"]),
  async (req, res) => {
    try {
      const pool = await getPool();
      await pool
        .request()
        .input("id", req.params.indicioId)
        .execute("sp_Indicios_Eliminar");

      res.json({ message: "Indicio eliminado" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al eliminar indicio" });
    }
  }
);

export default router;
