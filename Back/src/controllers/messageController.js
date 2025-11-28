import db from "../db/postgres.js";

// ======================================================
// OBTENER ID DE MATCH REAL (mutuo)
// Un match es válido solo si:
// A dio like a B
// Y B dio like a A
// ======================================================
const getRealMatchId = async (userA, userB) => {
    const likeAB = await db.get(`SELECT id FROM matches WHERE user1_id = $1 AND user2_id = $2`, [userA, userB]);
    if (!likeAB) return null;
    const likeBA = await db.get(`SELECT id FROM matches WHERE user1_id = $1 AND user2_id = $2`, [userB, userA]);
    if (!likeBA) return null;
    return Math.min(likeAB.id, likeBA.id);
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

        await db.run(`INSERT INTO messages (match_id, sender_id, content) VALUES ($1, $2, $3)`, [matchId, senderId, content]);
        res.json({ message: "Mensaje enviado", matchId });
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

        const rows = await db.all(`SELECT * FROM messages WHERE match_id = $1 ORDER BY created_at ASC`, [matchId]);
        res.json({ matchId, messages: rows });
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

        await db.run(`UPDATE messages SET read = true WHERE match_id = $1 AND sender_id != $2`, [matchId, userId]);
        res.json({ message: "Mensajes marcados como leídos" });
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

        const row = await db.get(`SELECT * FROM messages WHERE match_id = $1 ORDER BY created_at DESC LIMIT 1`, [matchId]);
        res.json({ lastMessage: row });
    } catch (error) {
        res.status(500).json({ error: "Error interno" });
    }
};
