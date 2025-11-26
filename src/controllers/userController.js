// userController.js
import db from "../db/database.js";

// ======================================================
// OBTENER MI PERFIL
// ======================================================
export const getMyProfile = (req, res) => {
    const userId = req.user.id;

    db.get(
        `SELECT id, email, document, description, chatLink, confirmed, blocked 
         FROM users WHERE id = ?`,
        [userId],
        (err, user) => {
            if (err) return res.status(500).json({ error: "Error interno" });
            res.json(user);
        }
    );
};

// ======================================================
// EDITAR PERFIL (usuario)
// ======================================================
export const editProfile = (req, res) => {
    const userId = req.user.id;
    const { description, chatLink } = req.body;

    db.run(
        `UPDATE users SET description = ?, chatLink = ? WHERE id = ?`,
        [description || "", chatLink || "", userId],
        err => {
            if (err) return res.status(500).json({ error: "Error interno" });
            res.json({ message: "Perfil actualizado correctamente" });
        }
    );
};

// ======================================================
// OBTENER PERFIL DE OTRO USUARIO
// (visible para usuario y anónimo)
// ======================================================
export const getUserProfile = (req, res) => {
    const { id } = req.params;

    db.get(
        `SELECT id, email, description, chatLink 
         FROM users 
         WHERE id = ? AND blocked = 0`,
        [id],
        (err, user) => {
            if (err) return res.status(500).json({ error: "Error interno" });
            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            res.json(user);
        }
    );
};

// ======================================================
// BUSCAR USUARIOS (nombre, email, descripción)
// Disponible para usuario y anónimo
// ======================================================
export const searchUsers = (req, res) => {
    const { q } = req.query;

    db.all(
        `SELECT id, email, description 
         FROM users 
         WHERE (email LIKE ? OR description LIKE ?)
         AND blocked = 0`,
        [`%${q}%`, `%${q}%`],
        (err, users) => {
            if (err) return res.status(500).json({ error: "Error en la búsqueda" });
            res.json(users);
        }
    );
};

// ======================================================
// LISTA DE USUARIOS PARA HACER MATCH (con swipe)
// ======================================================
export const listUsersForMatch = (req, res) => {
    const userId = req.user.id;

    db.all(
        `SELECT id, email, description 
         FROM users 
         WHERE id != ? 
         AND blocked = 0 
         AND confirmed = 1`,
        [userId],
        (err, users) => {
            if (err) return res.status(500).json({ error: "Error interno" });
            res.json(users);
        }
    );
};

// ======================================================
// ADMIN: LISTAR TODOS LOS USUARIOS
// ======================================================
export const adminGetUsers = (req, res) => {
    db.all(
        `SELECT id, email, document, role, confirmed, blocked 
         FROM users`,
        [],
        (err, users) => {
            if (err) return res.status(500).json({ error: "Error interno" });
            res.json(users);
        }
    );
};

// ======================================================
// ADMIN: BLOQUEAR USUARIO
// ======================================================
export const adminBlockUser = (req, res) => {
    const { id } = req.params;

    db.run(
        `UPDATE users SET blocked = 1 WHERE id = ?`,
        [id],
        err => {
            if (err) return res.status(500).json({ error: "Error interno" });
            res.json({ message: "Usuario bloqueado" });
        }
    );
};

// ======================================================
// ADMIN: ACTIVAR USUARIO
// ======================================================
export const adminActivateUser = (req, res) => {
    const { id } = req.params;

    db.run(
        `UPDATE users SET blocked = 0 WHERE id = ?`,
        [id],
        err => {
            if (err) return res.status(500).json({ error: "Error interno" });
            res.json({ message: "Usuario activado" });
        }
    );
};

// ======================================================
// ADMIN: ELIMINAR USUARIO
// ======================================================
export const adminDeleteUser = (req, res) => {
    const { id } = req.params;

    db.run(
        `DELETE FROM users WHERE id = ?`,
        [id],
        err => {
            if (err) return res.status(500).json({ error: "Error interno" });
            res.json({ message: "Usuario eliminado" });
        }
    );
};
