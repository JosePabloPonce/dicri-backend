import { jest } from "@jest/globals";
import request from "supertest";

jest.unstable_mockModule("../src/db.js", () => ({
  getPool: jest.fn(),
}));

const { default: app } = await import("../src/app.js");
const { getPool } = await import("../src/db.js");

describe("HEALTHCHECK (sin tocar base)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("GET /api/health devuelve 200 y status OK (mock)", async () => {
    getPool.mockResolvedValue({
      request: () => ({
        query: jest.fn().mockResolvedValue({
          recordset: [{ ok: 1 }],
        }),
      }),
    });

    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      db: 1,
    });
  });
});
