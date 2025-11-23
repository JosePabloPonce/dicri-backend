import { Router } from "express";
import jwt from "jsonwebtoken";
import { getPool } from "../db.js";

const router = Router();

// POST /api/login para que el usuario se logee
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("username", username)
      .execute("sp_Usuarios_ObtenerPorUsername");

    const user = result.recordset[0];

    if (!user || !user.activo) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (user.passwordHash !== password) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        rolId: user.rolId,
        rolNombre: user.rolNombre,
        userId: user.id,
      },
      process.env.JWT_SECRET || "secretito",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      nombre: user.nombreCompleto,
      rolId: user.rolId,
      rolNombre: user.rolNombre,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
