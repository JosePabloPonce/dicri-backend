export const requireRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado." });
    }

    const rolNombre = req.user.rolNombre;

    if (!rolesPermitidos.includes(rolNombre)) {
      return res
        .status(403)
        .json({ message: "No autorizado para esta acción." });
    }

    next();
  };
};
