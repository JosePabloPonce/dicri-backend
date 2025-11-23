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

describe("INDICIOS - endpoints SIN tocar base real", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("POST /api/expedientes/:id/indicios -> 401 sin token", async () => {
    const res = await request(app).post("/api/expedientes/10/indicios").send({
      descripcion: "Cuchillo",
      tecnicoId: 1,
    });

    expect(res.status).toBe(401);
  });

  test("POST /api/expedientes/:id/indicios -> 403 si rol NO es TECNICO", async () => {
    const res = await request(app)
      .post("/api/expedientes/10/indicios")
      .set("Authorization", tokenCoordinador())
      .send({
        descripcion: "Cuchillo",
        tecnicoId: 2,
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("No autorizado para esta acción.");
  });

  test("POST /api/expedientes/:id/indicios -> 201 con TECNICO y mock de BD", async () => {
    getPool.mockResolvedValue({
      request: () => ({
        input: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      }),
    });

    const res = await request(app)
      .post("/api/expedientes/10/indicios")
      .set("Authorization", tokenTecnico())
      .send({
        descripcion: "Cuchillo",
        color: "Plateado",
        tamano: "20cm",
        peso: "200g",
        ubicacion: "Mesa",
        tecnicoId: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Indicio agregado");
  });

  test("PUT /api/expedientes/:id/indicios/:indicioId -> 200 al actualizar con TECNICO", async () => {
    getPool.mockResolvedValue({
      request: () => ({
        input: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      }),
    });

    const res = await request(app)
      .put("/api/expedientes/10/indicios/99")
      .set("Authorization", tokenTecnico())
      .send({
        descripcion: "Cuchillo modificado",
        color: "Negro",
        tamano: "22cm",
        peso: "210g",
        ubicacion: "Bolsa",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Indicio actualizado");
  });

  test("DELETE /api/expedientes/:id/indicios/:indicioId -> 200 al eliminar con TECNICO", async () => {
    getPool.mockResolvedValue({
      request: () => ({
        input: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      }),
    });

    const res = await request(app)
      .delete("/api/expedientes/10/indicios/99")
      .set("Authorization", tokenTecnico());

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Indicio eliminado");
  });
});
