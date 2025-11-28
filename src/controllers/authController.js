import db from "../db/postgres.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// ============================================
// LOGIN con email o documento
// ============================================
export const login = async (req, res) => {
    const { emailOrDocument, password } = req.body;

    try {
        const user = await db.get(`SELECT * FROM users WHERE email = $1 OR document = $2`, [emailOrDocument, emailOrDocument]);
        if (!user) return res.status(400).json({ error: "Credenciales inválidas" });

        if (user.blocked) return res.status(403).json({ error: "Usuario bloqueado" });
        if (!user.confirmed) return res.status(403).json({ error: "Cuenta no confirmada" });

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(400).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ message: "Login exitoso", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ============================================
// REGISTRO DE USUARIO + token de confirmación
// ============================================
export const register = async (req, res) => {
    const { email, document, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    try {
        const insertUser = await db.run(
            `INSERT INTO users (email, document, password) VALUES ($1, $2, $3) RETURNING id`,
            [email, document, hashed]
        );

        const userId = insertUser.rows && insertUser.rows[0] ? insertUser.rows[0].id : null;

        const token = crypto.randomBytes(20).toString("hex");

        await db.run(`INSERT INTO tokens (user_id, token, type) VALUES ($1, $2, $3)`, [userId, token, "confirm"]);

        console.log("TOKEN DE CONFIRMACIÓN:", token);

        res.json({ message: "Usuario registrado. Revisa tu correo para confirmar tu cuenta.", confirm_token_dev: token });
    } catch (err) {
        if (err && err.code === '23505') {
            return res.status(400).json({ error: "Email o documento ya registrado" });
        }
        console.error(err);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
};

// ============================================
// CONFIRMAR CUENTA
// ============================================
export const confirmAccount = async (req, res) => {
    const { token } = req.params;
    try {
        const row = await db.get(`SELECT * FROM tokens WHERE token = $1 AND type = 'confirm'`, [token]);
        if (!row) return res.status(400).json({ error: "Token inválido o expirado" });

        await db.run(`UPDATE users SET confirmed = true WHERE id = $1`, [row.user_id]);
        await db.run(`DELETE FROM tokens WHERE id = $1`, [row.id]);

        res.json({ message: "Cuenta confirmada correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ============================================
// ENVIAR TOKEN DE RECUPERACIÓN DE CONTRASEÑA
// ============================================
export const sendRecoveryEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await db.get(`SELECT id FROM users WHERE email = $1`, [email]);
        if (!user) return res.status(404).json({ error: "Correo no encontrado" });

        const token = crypto.randomBytes(20).toString("hex");
        await db.run(`INSERT INTO tokens (user_id, token, type) VALUES ($1, $2, $3)`, [user.id, token, 'reset']);
        console.log("TOKEN DE RECUPERACIÓN:", token);
        res.json({ message: "Correo enviado para recuperación.", reset_token_dev: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ============================================
// RESTABLECER CONTRASEÑA DESDE TOKEN
// ============================================
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const row = await db.get(`SELECT * FROM tokens WHERE token = $1 AND type = 'reset'`, [token]);
        if (!row) return res.status(400).json({ error: "Token inválido" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.run(`UPDATE users SET password = $1 WHERE id = $2`, [hashed, row.user_id]);
        await db.run(`DELETE FROM tokens WHERE id = $1`, [row.id]);

        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};

// ============================================
// CAMBIAR CONTRASEÑA (usuario logueado)
// ============================================
export const changePassword = async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await db.get(`SELECT password FROM users WHERE id = $1`, [userId]);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) return res.status(400).json({ error: "Contraseña actual incorrecta" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.run(`UPDATE users SET password = $1 WHERE id = $2`, [hashed, userId]);
        res.json({ message: "Contraseña cambiada con éxito" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};
