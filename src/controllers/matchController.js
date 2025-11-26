import db from "../db/database.js";

// ======================================================
// DAR LIKE A OTRO USUARIO + detectar match
// ======================================================
export const giveLike = (req, res) => {
    const userId = req.user.id;
    const { toUserId } = req.body;

    if (!toUserId) {
        return res.status(400).json({ error: "Falta el ID del usuario objetivo" });
    }

    if (userId === toUserId) {
        return res.status(400).json({ error: "No puedes darte like a ti mismo" });
    }

    // Comprobar si el usuario objetivo está bloqueado o no confirmado
    db.get(
        `SELECT confirmed, blocked FROM users WHERE id=?`,
        [toUserId],
        (err, target) => {
            if (err) return res.status(500).json({ error: "Error interno" });
            if (!target) return res.status(404).json({ error: "Usuario no existe" });
            if (target.blocked) return res.status(403).json({ error: "El usuario está bloqueado" });
            if (!target.confirmed) return res.status(403).json({ error: "El usuario no ha confirmado su cuenta" });

            // Evitar like duplicado
            db.get(
                `SELECT id FROM matches WHERE user1_id = ? AND user2_id = ?`,
                [userId, toUserId],
                (err, existing) => {
                    if (existing) {
                        return res.json({ message: "Ya enviaste un like previamente", likeSent: true });
                    }

                    // Registrar like
                    db.run(
                        `INSERT INTO matches (user1_id, user2_id) VALUES (?, ?)`,
                        [userId, toUserId],
                        function (err) {
                            if (err) return res.status(500).json({ error: "Error guardando like" });

                            // Verificar si ya había like de la otra persona
                            db.get(
                                `SELECT id FROM matches WHERE user1_id = ? AND user2_id = ?`,
                                [toUserId, userId],
                                (err, reverseRow) => {
                                    if (reverseRow) {
                                        return res.json({
                                            message: "¡Es un Match!",
                                            match: true
                                        });
                                    }

                                    res.json({
                                        message: "Like enviado",
                                        match: false
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

// ======================================================
// OBTENER LISTA DE MATCHES (recíprocos)
// ======================================================
export const getMatches = (req, res) => {
    const userId = req.user.id;

    db.all(
        `
        SELECT 
            u.id, 
            u.email, 
            u.description,
            u.chatLink
        FROM matches m1
        JOIN matches m2
            ON m1.user1_id = m2.user2_id AND m1.user2_id = m2.user1_id
        JOIN users u 
            ON u.id = m1.user2_id
        WHERE m1.user1_id = ?
        `,
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: "Error obteniendo matches" });
            res.json(rows);
        }
    );
};

// ======================================================
// VERIFICAR SI DOS USUARIOS TIENEN MATCH (para mensajes)
// ======================================================
export const isMatch = (userA, userB) => {
    return new Promise((resolve, reject) => {
        db.get(
            `
            SELECT id FROM matches 
            WHERE (user1_id = ? AND user2_id = ?)
               OR (user1_id = ? AND user2_id = ?)
            `,
            [userA, userB, userB, userA],
            (err, row) => {
                if (err) return reject(err);
                resolve(!!row);
            }
        );
    });
};

// ======================================================
// ELIMINAR MATCH (opcional)
// ======================================================
export const removeMatch = (req, res) => {
    const userId = req.user.id;
    const { otherUserId } = req.body;

    db.run(
        `
        DELETE FROM matches 
        WHERE (user1_id = ? AND user2_id = ?)
           OR (user1_id = ? AND user2_id = ?)
        `,
        [userId, otherUserId, otherUserId, userId],
        (err) => {
            if (err) return res.status(500).json({ error: "Error al eliminar match" });

            res.json({ message: "Match eliminado correctamente" });
        }
    );
};
