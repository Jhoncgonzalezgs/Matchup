import express from "express";
import { auth } from "../middlewares/auth.js";
import {
    login,
    register,
    confirmAccount,
    changePassword,
    sendRecoveryEmail,
    resetPassword
} from "../controllers/authController.js";

const router = express.Router();

// ========================================
// RUTAS PÚBLICAS (sin autenticación)
// ========================================

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOrDocument:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso y token JWT
 */
router.post("/login", login);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               document:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario registrado y token de confirmación devuelto (dev only)
 */
router.post("/register", register);

/**
 * @openapi
 * /auth/confirm/{token}:
 *   get:
 *     summary: Confirmar cuenta de usuario
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cuenta confirmada correctamente
 */
router.get("/confirm/:token", confirmAccount);

/**
 * @openapi
 * /auth/recover:
 *   post:
 *     summary: Solicitar token de recuperación de contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token de recuperación enviado (dev only muestra token)
 */
router.post("/recover", sendRecoveryEmail);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña usando token de recuperación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 */
router.post("/reset-password", resetPassword);

// ========================================
// RUTAS AUTENTICADAS (requieren token)
// ========================================

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Cambiar contraseña del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña cambiada con éxito
 */
router.post("/change-password", auth, changePassword);

export default router;
