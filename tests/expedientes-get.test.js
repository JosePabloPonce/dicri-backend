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

describe("GET /api/expedientes SIN tocar base real", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("retorna 401 sin token", async () => {
    const res = await request(app).get("/api/expedientes");
    expect(res.status).toBe(401);
  });

  test("retorna 200 con mock de BD (sin insertar nada)", async () => {
    getPool.mockResolvedValue({
      request: () => ({
        execute: jest.fn().mockResolvedValue({
          recordset: [
            {
              id: 99,
              codigo: "TEST-123",
              fechaRegistro: "2025-01-01",
              estado: "EN_REGISTRO",
              tecnico: "Tester",
            },
          ],
        }),
      }),
    });

    const res = await request(app)
      .get("/api/expedientes")
      .set("Authorization", tokenTecnico());

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].codigo).toBe("TEST-123");
  });
});
