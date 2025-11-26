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

// Login con email o número de documento
router.post("/login", login);

// Registro de nuevo usuario
router.post("/register", register);

// Confirmar cuenta con token
router.get("/confirm/:token", confirmAccount);

// Solicitar correo con token de recuperación
router.post("/recover", sendRecoveryEmail);

// Cambiar contraseña usando token
router.post("/reset-password", resetPassword);

// ========================================
// RUTAS AUTENTICADAS (requieren token)
// ========================================

// Cambiar contraseña (requiere estar logueado)
router.post("/change-password", auth, changePassword);

export default router;
