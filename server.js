import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

import db from "./src/db/database.js";

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
app.use("/uploads", express.static(path.resolve("uploads")));

// Rutas reales
app.use("/auth", authRoutes);      // registro, login, confirmación, reset
app.use("/users", userRoutes);     // perfil y búsqueda
app.use("/match", matchRoutes);    // likes + matches
app.use("/messages", messageRoutes); // mensajes
app.use("/admin", adminRoutes);    // admin panel
app.use("/photos", photoRoutes);   // subir y obtener fotos

// Comprobación de base de datos
db.serialize(() => {
    console.log("📌 Base de datos cargada correctamente");
});

// Ruta principal
app.get("/", (req, res) => {
    res.send("🔥 Bienvenido a MatchUp API (Backend funcionando)");
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
});

// Inicialización del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 MatchUp backend running on port ${PORT}`);
});
