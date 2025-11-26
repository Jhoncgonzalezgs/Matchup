import fs from "fs";
import path from "path";
import db from "../db/database.js";

// ======================================================
// SUBIR FOTO (máximo 5 por usuario)
// ======================================================
export const uploadPhoto = (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
        return res.status(400).json({ error: "No se subió ninguna imagen" });
    }

    // Validar límite
    db.get(
        "SELECT COUNT(*) AS total FROM photos WHERE user_id = ?",
        [userId],
        (err, row) => {
            if (err) return res.status(500).json({ error: "Error interno" });

            if (row.total >= 5) {
                // Borramos archivo si se subió
                fs.unlinkSync(req.file.path);

                return res.status(400).json({
                    error: "Límite máximo alcanzado (5 fotos)"
                });
            }

            // Guardar referencia en BD
            db.run(
                "INSERT INTO photos (user_id, file_path) VALUES (?, ?)",
                [userId, req.file.filename],
                (err) => {
                    if (err) {
                        // Borrar archivo si falla
                        fs.unlinkSync(req.file.path);
                        return res
                            .status(500)
                            .json({ error: "Error al guardar imagen" });
                    }

                    res.json({
                        message: "Imagen subida correctamente",
                        file: req.file.filename,
                        url: `/uploads/${req.file.filename}`
                    });
                }
            );
        }
    );
};

// ======================================================
// OBTENER MIS FOTOS
// ======================================================
export const getMyPhotos = (req, res) => {
    const userId = req.user.id;

    db.all(
        "SELECT id, file_path FROM photos WHERE user_id = ?",
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: "Error interno" });

            const formatted = rows.map((p) => ({
                id: p.id,
                file_path: p.file_path,
                url: `/uploads/${p.file_path}`
            }));

            res.json(formatted);
        }
    );
};

// ======================================================
// OBTENER FOTOS DE OTRO USUARIO (público)
// ======================================================
export const getUserPhotos = (req, res) => {
    const userId = req.params.id;

    db.all(
        "SELECT id, file_path FROM photos WHERE user_id = ?",
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: "Error interno" });

            const formatted = rows.map((p) => ({
                id: p.id,
                file_path: p.file_path,
                url: `/uploads/${p.file_path}`
            }));

            res.json(formatted);
        }
    );
};

// ======================================================
// ELIMINAR FOTO
// ======================================================
export const deletePhoto = (req, res) => {
    const userId = req.user.id;
    const photoId = req.params.id;

    // 1. Validar que la foto existe y pertenece al usuario
    db.get(
        "SELECT file_path FROM photos WHERE id = ? AND user_id = ?",
        [photoId, userId],
        (err, row) => {
            if (err) return res.status(500).json({ error: "Error interno" });
            if (!row) return res.status(404).json({ error: "Foto no encontrada" });

            const uploadsDir = process.env.UPLOADS_DIR || "uploads";
            const filePath = path.join(uploadsDir, row.file_path);

            // 2. Eliminar archivo físico
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // 3. Eliminar referencia en BD
            db.run(
                "DELETE FROM photos WHERE id = ?",
                [photoId],
                (err) => {
                    if (err)
                        return res.status(500).json({ error: "Error al eliminar foto" });

                    res.json({ message: "Foto eliminada correctamente" });
                }
            );
        }
    );
};
