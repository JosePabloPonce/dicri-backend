CREATE DATABASE DICRI_DB;

USE DICRI_DB;


CREATE TABLE Roles (
  id INT IDENTITY PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL -- 'TECNICO', 'COORDINADOR'
);

CREATE TABLE Usuarios (
  id INT IDENTITY PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  nombreCompleto VARCHAR(100) NOT NULL,
  rolId INT NOT NULL FOREIGN KEY REFERENCES Roles(id),
  activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE Expedientes (
  id INT IDENTITY PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  fechaRegistro DATE NOT NULL,
  tecnicoId INT NOT NULL FOREIGN KEY REFERENCES Usuarios(id),
  estado VARCHAR(20) NOT NULL, -- 'EN_REGISTRO', 'EN_REVISION', 'APROBADO', 'RECHAZADO'
  justificacionRechazo VARCHAR(500) NULL
);

Select * from Indicios
SELECT * FROM EXPEDIENTES
CREATE TABLE Indicios (
  id INT IDENTITY PRIMARY KEY,
  expedienteId INT NOT NULL FOREIGN KEY REFERENCES Expedientes(id),
  descripcion VARCHAR(255) NOT NULL,
  color VARCHAR(50) NULL,
  tamano VARCHAR(50) NULL,
  peso VARCHAR(50) NULL,
  ubicacion VARCHAR(100) NULL,
  tecnicoId INT NOT NULL FOREIGN KEY REFERENCES Usuarios(id)
);

SELECT * FROM roles
select * from usuarios
select * from expedientes
--datos de prueba
INSERT INTO Roles (nombre) VALUES ('TECNICO'), ('COORDINADOR');

INSERT INTO Usuarios (username, passwordHash, nombreCompleto, rolId)
VALUES ('coord1',   '1234', 'Coordinador Uno', 2);

INSERT INTO Usuarios (username, passwordHash, nombreCompleto, rolId)
VALUES ('coord2',   '1234', 'Daniel Herrera', 2);


INSERT INTO Usuarios (username, passwordHash, nombreCompleto, rolId)
VALUES ('tecnico2', '123456', 'Jose Pablo Ponce', 1);

