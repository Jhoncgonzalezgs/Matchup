import fs from "fs";
import path from "path";
import db from "../db/postgres.js";

// ======================================================
// SUBIR FOTO (máximo 5 por usuario)
// ======================================================
export const uploadPhoto = async (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
        return res.status(400).json({ error: "No se subió ninguna imagen" });
    }

    // Validar límite
    try {
        const row = await db.get("SELECT COUNT(*) AS total FROM photos WHERE user_id = $1", [userId]);
        const total = parseInt(row.total || row.count || 0, 10);
        if (total >= 5) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "Límite máximo alcanzado (5 fotos)" });
        }

        await db.run("INSERT INTO photos (user_id, file_path) VALUES ($1, $2)", [userId, req.file.filename]);
        res.json({ message: "Imagen subida correctamente", file: req.file.filename, url: `/uploads/${req.file.filename}` });
    } catch (err) {
        console.error(err);
        if (req.file && req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "Error al guardar imagen" });
    }
};

// ======================================================
// OBTENER MIS FOTOS
// ======================================================
export const getMyPhotos = async (req, res) => {
    const userId = req.user.id;
    try {
        const rows = await db.all("SELECT id, file_path FROM photos WHERE user_id = $1", [userId]);
        const formatted = rows.map((p) => ({ id: p.id, file_path: p.file_path, url: `/uploads/${p.file_path}` }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// OBTENER FOTOS DE OTRO USUARIO (público)
// ======================================================
export const getUserPhotos = async (req, res) => {
    const userId = req.params.id;
    try {
        const rows = await db.all("SELECT id, file_path FROM photos WHERE user_id = $1", [userId]);
        const formatted = rows.map((p) => ({ id: p.id, file_path: p.file_path, url: `/uploads/${p.file_path}` }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// ELIMINAR FOTO
// ======================================================
export const deletePhoto = async (req, res) => {
    const userId = req.user.id;
    const photoId = req.params.id;

    // 1. Validar que la foto existe y pertenece al usuario
    try {
        const row = await db.get("SELECT file_path FROM photos WHERE id = $1 AND user_id = $2", [photoId, userId]);
        if (!row) return res.status(404).json({ error: "Foto no encontrada" });
        const uploadsDir = process.env.UPLOADS_DIR || "uploads";
        const filePath = path.join(uploadsDir, row.file_path);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await db.run("DELETE FROM photos WHERE id = $1", [photoId]);
        res.json({ message: "Foto eliminada correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};
