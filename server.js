import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Cargar variables de entorno
dotenv.config();

import db from "./src/db/postgres.js";

// Importación de rutas
import userRoutes from "./src/routes/userRoutes.js";
import matchRoutes from "./src/routes/matchRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import photoRoutes from "./src/routes/photoRoutes.js";

const app = express();

// Middleware global
app.use(express.json());
app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE" }));

// Servir imágenes (uploads/)
// Determinar carpeta uploads en base a env, por ejemplo '/data/uploads' en Docker
const uploadsDir = process.env.UPLOADS_DIR || "uploads";
// Asegurar que exista la carpeta
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
// Servir archivos estáticos del frontend (carpeta public)
app.use(express.static(path.resolve("public")));
app.use("/uploads", express.static(path.resolve(uploadsDir)));

// Rutas reales
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/match", matchRoutes);
app.use("/messages", messageRoutes);
app.use("/admin", adminRoutes);
app.use("/photos", photoRoutes);

// Comprobación de base de datos
// Initialize Postgres and create tables
db.init().then(() => console.log('📌 Base de datos PostgreSQL inicializada correctamente'))
    .catch(err => console.error('❌ Error inicializando la BD Postgres:', err.message));

// Servir index.html por defecto si existe en /public
app.get("/", (req, res) => {
    const indexFile = path.resolve("public/index.html");
    if (fs.existsSync(indexFile)) {
        return res.sendFile(indexFile);
    }
    res.send("🔥 Bienvenido a MatchUp API (Backend funcionando)");
});
/**
 * @openapi
 * /:
 *   get:
 *     summary: Welcome / root endpoint
 *     description: Devuelve un mensaje de bienvenida para confirmar que la API está en funcionamiento.
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida
 */
// Nota: la ruta "/" ya sirve `public/index.html` si existe.

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: Indica el estado del servicio.
 *     responses:
 *       200:
 *         description: Status ok
 */
// Health check (Render, Kubernetes, etc. pueden usar esto)
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
});

// =========================
// Swagger OpenAPI v3
// =========================
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MatchUp API",
            version: "1.0.0",
            description: "API para MatchUp (dating app)"
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [
            { bearerAuth: [] }
        ],
        servers: [
            { url: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}` }
        ]
    },
    apis: [
        "./src/routes/*.js",
        "./src/controllers/*.js",
        "./server.js"
    ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get("/docs.json", (_req, res) => res.json(swaggerSpec));

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
});

// Inicialización del servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

if (!process.env.JWT_SECRET) {
    console.warn("⚠️ JWT_SECRET no definido. Genera uno y colócalo en las variables de entorno para entornos de producción.");
}

app.listen(PORT, HOST, () => {
    console.log(`🚀 MatchUp backend running on ${HOST}:${PORT}`);
});
