import db from "../db/database.js";

// ============================
// LISTAR USUARIOS
// ============================
export const listUsers = (req, res) => {
    db.all(
        `SELECT id, email, document, role, confirmed, blocked, created_at 
         FROM users`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: "Error al obtener usuarios" });
            res.json(rows);
        }
    );
};

// ============================
// BLOQUEAR / DESBLOQUEAR USUARIO
// ============================
export const blockUser = (req, res) => {
    const { userId, block } = req.body; // block = 1 (bloquear), 0 (desbloquear)

    db.run(
        `UPDATE users SET blocked = ? WHERE id = ?`,
        [block, userId],
        err => {
            if (err) return res.status(500).json({ error: "Error al actualizar estado" });

            // Registrar acción del administrador
            db.run(
                `INSERT INTO admin_logs (admin_id, action, target_user)
                 VALUES (?, ?, ?)`,
                [req.user.id, block ? "BLOCK_USER" : "UNBLOCK_USER", userId]
            );

            res.json({
                message: block ? "Usuario bloqueado" : "Usuario desbloqueado"
            });
        }
    );
};
