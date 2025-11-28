import express from "express";
import { auth } from "../middlewares/auth.js";
import { sendMessage, getMessages, getLastMessage, markAsRead } from "../controllers/messageController.js";

const router = express.Router();

/**
 * @openapi
 * /messages:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Enviar un mensaje a usuario con match
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toUserId:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mensaje enviado
 */
// Enviar un mensaje
router.post("/", auth, sendMessage);

/**
 * @openapi
 * /messages/{otherUserId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener mensajes de un match con otro usuario
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de mensajes
 */
// Obtener mensajes de un usuario específico
router.get("/:otherUserId", auth, getMessages);

/**
 * @openapi
 * /messages/last/{otherUserId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener el último mensaje entre usuarios emparejados
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Último mensaje
 */
// Obtener último mensaje
router.get("/last/:otherUserId", auth, getLastMessage);

/**
 * @openapi
 * /messages/mark-as-read:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Marcar mensajes como leídos dentro de un match
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otherUserId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Mensajes marcados como leídos
 */
// Marcar mensajes como leídos
router.post("/mark-as-read", auth, markAsRead);

export default router;
