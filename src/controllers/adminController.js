import db from "../db/postgres.js";

// ============================
// LISTAR USUARIOS
// ============================
export const listUsers = async (req, res) => {
    try {
        const rows = await db.all(`SELECT id, email, document, role, confirmed, blocked, created_at FROM users`);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
};

// ============================
// BLOQUEAR / DESBLOQUEAR USUARIO
// ============================
export const blockUser = async (req, res) => {
    const { userId, block } = req.body; // block = 1 (bloquear), 0 (desbloquear)
    try {
        await db.run(`UPDATE users SET blocked = $1 WHERE id = $2`, [block ? true : false, userId]);
        await db.run(`INSERT INTO admin_logs (admin_id, action, target_user) VALUES ($1, $2, $3)`, [req.user.id, block ? "BLOCK_USER" : "UNBLOCK_USER", userId]);
        res.json({ message: block ? "Usuario bloqueado" : "Usuario desbloqueado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar estado" });
    }
};
