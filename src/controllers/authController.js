import db from "../db/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// ============================================
// LOGIN con email o documento
// ============================================
export const login = (req, res) => {
    const { emailOrDocument, password } = req.body;

    db.get(
        `SELECT * FROM users WHERE email = ? OR document = ?`,
        [emailOrDocument, emailOrDocument],
        async (err, user) => {
            if (err) return res.status(500).json({ error: "Error interno" });
            if (!user) return res.status(400).json({ error: "Credenciales inválidas" });

            if (user.blocked) return res.status(403).json({ error: "Usuario bloqueado" });
            if (!user.confirmed) return res.status(403).json({ error: "Cuenta no confirmada" });

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) return res.status(400).json({ error: "Contraseña incorrecta" });

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({
                message: "Login exitoso",
                token
            });
        }
    );
};

// ============================================
// REGISTRO DE USUARIO + token de confirmación
// ============================================
export const register = async (req, res) => {
    const { email, document, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (email, document, password) VALUES (?, ?, ?)`,
        [email, document, hashed],
        function (err) {
            if (err) {
                if (err.message.includes("UNIQUE")) {
                    return res.status(400).json({ error: "Email o documento ya registrado" });
                }
                return res.status(500).json({ error: "Error al registrar usuario" });
            }

            const userId = this.lastID;

            const token = crypto.randomBytes(20).toString("hex");

            db.run(
                `INSERT INTO tokens (user_id, token, type) VALUES (?, ?, ?)`,
                [userId, token, "confirm"]
            );

            console.log("TOKEN DE CONFIRMACIÓN:", token);

            res.json({
                message: "Usuario registrado. Revisa tu correo para confirmar tu cuenta.",
                confirm_token_dev: token
            });
        }
    );
};

// ============================================
// CONFIRMAR CUENTA
// ============================================
export const confirmAccount = (req, res) => {
    const { token } = req.params;

    db.get(
        `SELECT * FROM tokens WHERE token = ? AND type = 'confirm'`,
        [token],
        (err, row) => {
            if (err) return res.status(500).json({ error: "Error interno" });
            if (!row) return res.status(400).json({ error: "Token inválido o expirado" });

            db.run(
                `UPDATE users SET confirmed = 1 WHERE id = ?`,
                [row.user_id],
                err => {
                    if (err) return res.status(500).json({ error: "Error al confirmar cuenta" });

                    db.run(`DELETE FROM tokens WHERE id = ?`, [row.id]); // borrar token

                    res.json({ message: "Cuenta confirmada correctamente" });
                }
            );
        }
    );
};

// ============================================
// ENVIAR TOKEN DE RECUPERACIÓN DE CONTRASEÑA
// ============================================
export const sendRecoveryEmail = (req, res) => {
    const { email } = req.body;

    db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) return res.status(500).json({ error: "Error interno" });
        if (!user) return res.status(404).json({ error: "Correo no encontrado" });

        const token = crypto.randomBytes(20).toString("hex");

        db.run(
            `INSERT INTO tokens (user_id, token, type) VALUES (?, ?, ?)`,
            [user.id, token, "reset"]
        );

        console.log("TOKEN DE RECUPERACIÓN:", token);

        res.json({
            message: "Correo enviado para recuperación.",
            reset_token_dev: token
        });
    });
};

// ============================================
// RESTABLECER CONTRASEÑA DESDE TOKEN
// ============================================
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    db.get(
        `SELECT * FROM tokens WHERE token = ? AND type = 'reset'`,
        [token],
        async (err, row) => {
            if (err) return res.status(500).json({ error: "Error interno" });
            if (!row) return res.status(400).json({ error: "Token inválido" });

            const hashed = await bcrypt.hash(newPassword, 10);

            db.run(
                `UPDATE users SET password = ? WHERE id = ?`,
                [hashed, row.user_id],
                err => {
                    if (err) return res.status(500).json({ error: "Error al actualizar contraseña" });

                    db.run(`DELETE FROM tokens WHERE id = ?`, [row.id]);

                    res.json({ message: "Contraseña actualizada correctamente" });
                }
            );
        }
    );
};

// ============================================
// CAMBIAR CONTRASEÑA (usuario logueado)
// ============================================
export const changePassword = (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    db.get(`SELECT password FROM users WHERE id = ?`, [userId], async (err, user) => {
        if (err) return res.status(500).json({ error: "Error interno" });
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) return res.status(400).json({ error: "Contraseña actual incorrecta" });

        const hashed = await bcrypt.hash(newPassword, 10);

        db.run(
            `UPDATE users SET password = ? WHERE id = ?`,
            [hashed, userId],
            err => {
                if (err) return res.status(500).json({ error: "Error al cambiar contraseña" });

                res.json({ message: "Contraseña cambiada con éxito" });
            }
        );
    });
};
