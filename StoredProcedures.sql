USE DICRI_DB;


CREATE PROCEDURE sp_Expedientes_Listar
AS
BEGIN
  SELECT e.id, e.codigo, e.fechaRegistro, e.estado,
         u.nombreCompleto AS tecnico
  FROM Expedientes e
  JOIN Usuarios u ON u.id = e.tecnicoId;
END;



CREATE PROCEDURE sp_Expedientes_Obtener
  @id INT
AS
BEGIN
  SELECT * FROM Expedientes WHERE id = @id;

  SELECT * FROM Indicios WHERE expedienteId = @id;
END;



CREATE PROCEDURE sp_Expedientes_Crear
  @codigo VARCHAR(50),
  @fechaRegistro DATE,
  @tecnicoId INT
AS
BEGIN
  INSERT INTO Expedientes (codigo, fechaRegistro, tecnicoId, estado)
  VALUES (@codigo, @fechaRegistro, @tecnicoId, 'EN_REGISTRO');

  SELECT SCOPE_IDENTITY() AS id;
END;



CREATE PROCEDURE sp_Expedientes_CambiarEstado
  @id INT,
  @nuevoEstado VARCHAR(20),
  @justificacionRechazo VARCHAR(500) = NULL
AS
BEGIN
  UPDATE Expedientes
  SET estado = @nuevoEstado,
      justificacionRechazo = @justificacionRechazo
  WHERE id = @id;
END;



CREATE PROCEDURE sp_Indicios_Agregar
  @expedienteId INT,
  @descripcion VARCHAR(255),
  @color VARCHAR(50) = NULL,
  @tamano VARCHAR(50) = NULL,
  @peso VARCHAR(50) = NULL,
  @ubicacion VARCHAR(100) = NULL,
  @tecnicoId INT
AS
BEGIN
  INSERT INTO Indicios (expedienteId, descripcion, color, tamano, peso, ubicacion, tecnicoId)
  VALUES (@expedienteId, @descripcion, @color, @tamano, @peso, @ubicacion, @tecnicoId);
END;



CREATE PROCEDURE sp_Reportes_Expedientes
  @fechaInicio DATE = NULL,
  @fechaFin DATE = NULL,
  @estado VARCHAR(20) = NULL
AS
BEGIN
  SELECT e.*, u.nombreCompleto AS tecnico
  FROM Expedientes e
  JOIN Usuarios u ON u.id = e.tecnicoId
  WHERE (@fechaInicio IS NULL OR e.fechaRegistro >= @fechaInicio)
    AND (@fechaFin   IS NULL OR e.fechaRegistro <= @fechaFin)
    AND (@estado IS NULL OR e.estado = @estado);
END;

-- Actualizar un indicio
CREATE PROCEDURE sp_Indicios_Actualizar
  @id INT,
  @descripcion VARCHAR(255),
  @color VARCHAR(50) = NULL,
  @tamano VARCHAR(50) = NULL,
  @peso VARCHAR(50) = NULL,
  @ubicacion VARCHAR(100) = NULL
AS
BEGIN
  UPDATE Indicios
  SET descripcion = @descripcion,
      color = @color,
      tamano = @tamano,
      peso = @peso,
      ubicacion = @ubicacion
  WHERE id = @id;
END;


-- Eliminar un indicio
CREATE PROCEDURE sp_Indicios_Eliminar
  @id INT
AS
BEGIN
  DELETE FROM Indicios WHERE id = @id;
END;


CREATE PROCEDURE sp_Usuarios_ObtenerPorUsername
  @username VARCHAR(50)
AS
BEGIN
  SELECT TOP 1 u.id,
               u.username,
               u.passwordHash,
               u.nombreCompleto,
               u.rolId,
               r.nombre AS rolNombre,
               u.activo
  FROM Usuarios u
  JOIN Roles r ON r.id = u.rolId
  WHERE u.username = @username;
END;
