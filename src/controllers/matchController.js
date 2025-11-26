import db from "../db/postgres.js";

// ======================================================
// DAR LIKE A OTRO USUARIO + detectar match
// ======================================================
export const giveLike = async (req, res) => {
    const userId = req.user.id;
    const { toUserId } = req.body;

    if (!toUserId) {
        return res.status(400).json({ error: "Falta el ID del usuario objetivo" });
    }

    if (userId === toUserId) {
        return res.status(400).json({ error: "No puedes darte like a ti mismo" });
    }

    // Comprobar si el usuario objetivo está bloqueado o no confirmado
    try {
        const target = await db.get(`SELECT confirmed, blocked FROM users WHERE id=$1`, [toUserId]);
        if (!target) return res.status(404).json({ error: "Usuario no existe" });
        if (target.blocked) return res.status(403).json({ error: "El usuario está bloqueado" });
        if (!target.confirmed) return res.status(403).json({ error: "El usuario no ha confirmado su cuenta" });

        // Evitar like duplicado
        const existing = await db.get(`SELECT id FROM matches WHERE user1_id = $1 AND user2_id = $2`, [userId, toUserId]);
        if (existing) return res.json({ message: "Ya enviaste un like previamente", likeSent: true });

        // Registrar like
        await db.run(`INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2)`, [userId, toUserId]);

        // Verificar si ya había like de la otra persona
        const reverseRow = await db.get(`SELECT id FROM matches WHERE user1_id = $1 AND user2_id = $2`, [toUserId, userId]);
        if (reverseRow) {
            return res.json({ message: "¡Es un Match!", match: true });
        }

        res.json({ message: "Like enviado", match: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ======================================================
// OBTENER LISTA DE MATCHES (recíprocos)
// ======================================================
export const getMatches = async (req, res) => {
    const userId = req.user.id;
    try {
        const rows = await db.all(
            `SELECT u.id, u.email, u.description, u.chatlink AS "chatLink" 
            FROM matches m1
            JOIN matches m2 ON m1.user1_id = m2.user2_id AND m1.user2_id = m2.user1_id
            JOIN users u ON u.id = m1.user2_id
            WHERE m1.user1_id = $1`,
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error obteniendo matches" });
    }
};

// ======================================================
// VERIFICAR SI DOS USUARIOS TIENEN MATCH (para mensajes)
// ======================================================
export const isMatch = async (userA, userB) => {
    try {
        const row = await db.get(`SELECT id FROM matches WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $3 AND user2_id = $4)`, [userA, userB, userB, userA]);
        return !!row;
    } catch (err) {
        throw err;
    }
};

// ======================================================
// ELIMINAR MATCH (opcional)
// ======================================================
export const removeMatch = async (req, res) => {
    const userId = req.user.id;
    const otherUserId = req.body.otherUserId || req.params.otherUserId;
    try {
        await db.run(`DELETE FROM matches WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $3 AND user2_id = $4)`, [userId, otherUserId, otherUserId, userId]);
        res.json({ message: "Match eliminado correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar match" });
    }
};
