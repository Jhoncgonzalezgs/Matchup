import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import http from "http";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

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
    const msg = "❌ JWT_SECRET no definido. Establece JWT_SECRET en las variables de entorno antes de iniciar la aplicación.";
    if (process.env.NODE_ENV === 'production') {
        console.error(msg);
        process.exit(1);
    } else {
        console.warn(msg + " Se recomienda configurar en todos los entornos.");
    }
}

// HTTP server (to attach WebSocket server)
const server = http.createServer(app);

// WebSocket: Mensajería en tiempo real
const wss = new WebSocketServer({ server, path: '/ws' });
// Map userId -> ws
const wsClients = new Map();

wss.on('connection', (ws, req) => {
    try {
        const u = new URL(req.url, `http://${req.headers.host}`);
        const token = u.searchParams.get('token');
        if (!token) throw new Error('No token');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        ws.userId = userId;
        wsClients.set(userId, ws);

        ws.on('message', async (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type === 'send_message' && msg.toUserId && msg.content) {
                    // Verificar match
                    const rows = await db.all(
                        `SELECT id FROM matches WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
                        [userId, msg.toUserId]
                    );
                    if (!rows || rows.length === 0) {
                        return ws.send(JSON.stringify({ type: 'error', message: 'No match' }));
                    }
                    const matchId = rows[0].id;
                    // Insert message
                    await db.run(`INSERT INTO messages (match_id, sender_id, content) VALUES ($1, $2, $3)`, [matchId, userId, msg.content]);

                    const payload = { type: 'message', from: userId, to: msg.toUserId, content: msg.content, matchId };
                    // Enviar al receptor si está conectado
                    const recipientWs = wsClients.get(msg.toUserId);
                    if (recipientWs && recipientWs.readyState === 1) {
                        recipientWs.send(JSON.stringify(payload));
                    }
                    // Confirm on sender
                    ws.send(JSON.stringify({ type: 'sent', ...payload }));
                }
            } catch (err) {
                console.error('WebSocket message error:', err.message);
            }
        });

        ws.on('close', () => {
            wsClients.delete(userId);
        });
    } catch (err) {
        ws.close();
    }
});

server.listen(PORT, HOST, () => {
    console.log(`🚀 MatchUp backend running on ${HOST}:${PORT} (with WebSocket /ws)`);
});
