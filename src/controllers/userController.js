// userController.js
import db from "../db/postgres.js";

// ======================================================
// OBTENER MI PERFIL
// ======================================================
export const getMyProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await db.get(`SELECT id, email, document, description, chatlink AS "chatLink", confirmed, blocked FROM users WHERE id = $1`, [userId]);
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// EDITAR PERFIL (usuario)
// ======================================================
export const editProfile = async (req, res) => {
    const userId = req.user.id;
    const { description, chatLink } = req.body;
    try {
        await db.run(`UPDATE users SET description = $1, chatlink = $2 WHERE id = $3`, [description || "", chatLink || "", userId]);
        res.json({ message: "Perfil actualizado correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// OBTENER PERFIL DE OTRO USUARIO
// (visible para usuario y anónimo)
// ======================================================
export const getUserProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await db.get(`SELECT id, email, description, chatlink AS "chatLink" FROM users WHERE id = $1 AND blocked = false`, [id]);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// BUSCAR USUARIOS (nombre, email, descripción)
// Disponible para usuario y anónimo
// ======================================================
export const searchUsers = async (req, res) => {
    const { q = '' } = req.query;
    try {
        const users = await db.all(`SELECT id, email, description FROM users WHERE (email ILIKE $1 OR description ILIKE $1) AND blocked = false`, [`%${q}%`]);
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en la búsqueda" });
    }
};

// ======================================================
// LISTA DE USUARIOS PARA HACER MATCH (con swipe)
// ======================================================
export const listUsersForMatch = async (req, res) => {
    const userId = req.user.id;
    try {
        const users = await db.all(`SELECT id, email, description FROM users WHERE id != $1 AND blocked = false AND confirmed = true`, [userId]);
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// ADMIN: LISTAR TODOS LOS USUARIOS
// ======================================================
export const adminGetUsers = async (req, res) => {
    try {
        const users = await db.all(`SELECT id, email, document, role, confirmed, blocked FROM users`);
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// ADMIN: BLOQUEAR USUARIO
// ======================================================
export const adminBlockUser = async (req, res) => {
    const { id } = req.params || req.body;
    try {
        await db.run(`UPDATE users SET blocked = true WHERE id = $1`, [id]);
        res.json({ message: "Usuario bloqueado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// ADMIN: ACTIVAR USUARIO
// ======================================================
export const adminActivateUser = async (req, res) => {
    const { id } = req.params || req.body;
    try {
        await db.run(`UPDATE users SET blocked = false WHERE id = $1`, [id]);
        res.json({ message: "Usuario activado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// ADMIN: ELIMINAR USUARIO
// ======================================================
export const adminDeleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.run(`DELETE FROM users WHERE id = $1`, [id]);
        res.json({ message: "Usuario eliminado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};
