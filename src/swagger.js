import swaggerUi from "swagger-ui-express";

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API DICRI",
    version: "1.0.0",
    description:
      "API para gestión de expedientes e indicios de la DICRI (Prueba técnica).",
  },
  servers: [
    {
      url: "http://localhost:4000",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login y obtención de token JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", example: "tecnico1" },
                  password: { type: "string", example: "123456" },
                },
                required: ["username", "password"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login exitoso",
          },
          401: {
            description: "Credenciales inválidas",
          },
        },
      },
    },
    "/api/expedientes": {
      get: {
        tags: ["Expedientes"],
        summary: "Lista expedientes (solo TECNICO o COORDINADOR)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "OK - listado de expedientes" },
          401: { description: "No autenticado (falta token)" },
          403: { description: "No autorizado (rol no permitido)" },
        },
      },
      post: {
        tags: ["Expedientes"],
        summary: "Crear expediente (solo TECNICO)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["codigo", "fechaRegistro", "tecnicoId"],
                properties: {
                  codigo: { type: "string" },
                  fechaRegistro: { type: "string", format: "date" },
                  tecnicoId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Expediente creado" },
          401: { description: "No autenticado" },
          403: { description: "Rol no permitido" },
        },
      },
    },

    "/api/expedientes/{id}": {
      get: {
        tags: ["Expedientes"],
        summary: "Obtener expediente + indicios (solo TECNICO o COORDINADOR)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Detalle del expediente" },
          401: { description: "No autenticado" },
          403: { description: "No autorizado" },
        },
      },
    },

    "/api/expedientes/{id}/estado": {
      post: {
        tags: ["Expedientes"],
        summary: "Cambiar estado de un expediente",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nuevoEstado: {
                    type: "string",
                    enum: ["EN_REVISION", "APROBADO", "RECHAZADO"],
                  },
                  justificacionRechazo: { type: "string" },
                },
                required: ["nuevoEstado"],
              },
            },
          },
        },
        responses: {
          200: { description: "Estado actualizado" },
          400: {
            description: "Error de validación (ej. rechazo sin justificación)",
          },
          401: { description: "No autenticado" },
          403: { description: "No autorizado" },
        },
      },
    },
    "/api/expedientes/{id}/indicios": {
      post: {
        tags: ["Indicios"],
        summary: "Agregar indicio (solo TECNICO)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["descripcion", "tecnicoId"],
                properties: {
                  descripcion: { type: "string" },
                  color: { type: "string" },
                  tamano: { type: "string" },
                  peso: { type: "string" },
                  ubicacion: { type: "string" },
                  tecnicoId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Indicio agregado" },
          401: { description: "No autenticado" },
          403: { description: "No autorizado (rol incorrecto)" },
        },
      },
    },

    "/api/reportes": {
      get: {
        tags: ["Reportes"],
        summary: "Reportes por fecha y estado",
        parameters: [
          {
            in: "query",
            name: "fechaInicio",
            schema: { type: "string", format: "date" },
          },
          {
            in: "query",
            name: "fechaFin",
            schema: { type: "string", format: "date" },
          },
          {
            in: "query",
            name: "estado",
            schema: {
              type: "string",
              enum: ["EN_REGISTRO", "EN_REVISION", "APROBADO", "RECHAZADO"],
            },
          },
        ],
        responses: {
          200: { description: "OK" },
          401: { description: "No autenticado" },
          403: { description: "No autorizado" },
        },
      },
    },
  },
};

export { swaggerUi };
