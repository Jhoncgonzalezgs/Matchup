import express from "express";
import { listUsers, blockUser } from "../controllers/adminController.js";
import { auth } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

/**
 * @openapi
 * /admin/users:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Listar todos los usuarios (solo admin)
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get("/users", auth, isAdmin, listUsers);

/**
 * @openapi
 * /admin/block:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Bloquear o desbloquear usuario por id (solo admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               block:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuario bloqueado/desbloqueado
 */
router.post("/block", auth, isAdmin, blockUser);

export default router;
