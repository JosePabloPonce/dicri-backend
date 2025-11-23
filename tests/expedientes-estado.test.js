import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

jest.unstable_mockModule("../src/db.js", () => ({
  getPool: jest.fn(),
}));

const { default: app } = await import("../src/app.js");
const { getPool } = await import("../src/db.js");

const tokenTecnico = () =>
  "Bearer " +
  jwt.sign(
    { userId: 1, rolId: 1, rolNombre: "TECNICO" },
    process.env.JWT_SECRET || "secretito"
  );

const tokenCoordinador = () =>
  "Bearer " +
  jwt.sign(
    { userId: 2, rolId: 2, rolNombre: "COORDINADOR" },
    process.env.JWT_SECRET || "secretito"
  );

describe("POST /api/expedientes/:id/estado SIN tocar base", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("técnico puede enviar a revisión (EN_REVISION) -> 200", async () => {
    getPool.mockResolvedValue({
      request: () => ({
        input: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      }),
    });

    const res = await request(app)
      .post("/api/expedientes/5/estado")
      .set("Authorization", tokenTecnico())
      .send({ nuevoEstado: "EN_REVISION" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Estado actualizado");
  });

  test("coordinador NO puede enviar a revisión -> 403", async () => {
    getPool.mockResolvedValue({
      request: () => ({
        input: jest.fn().mockReturnThis(),
        execute: jest.fn(),
      }),
    });

    const res = await request(app)
      .post("/api/expedientes/5/estado")
      .set("Authorization", tokenCoordinador())
      .send({ nuevoEstado: "EN_REVISION" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Solo el técnico puede enviar a revisión.");
  });

  test("rechazo sin justificación devuelve 400", async () => {
    getPool.mockResolvedValue({
      request: () => ({
        input: jest.fn().mockReturnThis(),
        execute: jest.fn(),
      }),
    });

    const res = await request(app)
      .post("/api/expedientes/5/estado")
      .set("Authorization", tokenCoordinador())
      .send({ nuevoEstado: "RECHAZADO", justificacionRechazo: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Debe ingresar una justificación para rechazar."
    );
  });

  test("coordinador puede aprobar -> 200", async () => {
    getPool.mockResolvedValue({
      request: () => ({
        input: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      }),
    });

    const res = await request(app)
      .post("/api/expedientes/5/estado")
      .set("Authorization", tokenCoordinador())
      .send({ nuevoEstado: "APROBADO" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Estado actualizado");
  });
});
