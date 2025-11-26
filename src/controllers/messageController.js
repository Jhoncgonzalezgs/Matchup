import db from "../db/database.js";

// ======================================================
// OBTENER ID DE MATCH REAL (mutuo)
// Un match es válido solo si:
// A dio like a B
// Y B dio like a A
// ======================================================
const getRealMatchId = (userA, userB) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT id FROM matches
             WHERE user1_id = ? AND user2_id = ?`,
            [userA, userB],
            (err, likeAB) => {
                if (err) return reject(err);
                if (!likeAB) return resolve(null);

                db.get(
                    `SELECT id FROM matches
                     WHERE user1_id = ? AND user2_id = ?`,
                    [userB, userA],
                    (err, likeBA) => {
                        if (err) return reject(err);
                        if (!likeBA) return resolve(null);

                        // ID del match = menor ID de ambas filas
                        const matchId = Math.min(likeAB.id, likeBA.id);
                        resolve(matchId);
                    }
                );
            }
        );
    });
};

// ======================================================
// ENVIAR MENSAJE ENTRE MATCHES
// ======================================================
export const sendMessage = async (req, res) => {
    const senderId = req.user.id;
    const { toUserId, content } = req.body;

    if (!toUserId || !content) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    try {
        const matchId = await getRealMatchId(senderId, toUserId);

        if (!matchId) {
            return res.status(403).json({ error: "No tienes match con este usuario" });
        }

        db.run(
            `INSERT INTO messages (match_id, sender_id, content)
             VALUES (?, ?, ?)`,
            [matchId, senderId, content],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Mensaje enviado", matchId });
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// OBTENER MENSAJES DE UN MATCH
// ======================================================
export const getMessages = async (req, res) => {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    try {
        const matchId = await getRealMatchId(userId, otherUserId);

        if (!matchId) {
            return res.status(403).json({ error: "No tienes match con este usuario" });
        }

        db.all(
            `SELECT * FROM messages 
             WHERE match_id = ?
             ORDER BY created_at ASC`,
            [matchId],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ matchId, messages: rows });
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// MARCAR MENSAJES COMO LEÍDOS
// ======================================================
export const markAsRead = async (req, res) => {
    const userId = req.user.id;
    const { otherUserId } = req.body;

    try {
        const matchId = await getRealMatchId(userId, otherUserId);

        if (!matchId) {
            return res.status(403).json({ error: "No tienes match con este usuario" });
        }

        db.run(
            `UPDATE messages 
             SET read = 1
             WHERE match_id = ? AND sender_id != ?`,
            [matchId, userId],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Mensajes marcados como leídos" });
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// OBTENER ÚLTIMO MENSAJE (para mostrar lista de chats)
// ======================================================
export const getLastMessage = async (req, res) => {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    try {
        const matchId = await getRealMatchId(userId, otherUserId);

        if (!matchId) {
            return res.json({ lastMessage: null });
        }

        db.get(
            `SELECT * FROM messages
             WHERE match_id = ?
             ORDER BY created_at DESC
             LIMIT 1`,
            [matchId],
            (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ lastMessage: row });
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Error interno" });
    }
};
