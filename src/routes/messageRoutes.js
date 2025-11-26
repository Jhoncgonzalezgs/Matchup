import express from "express";
import { auth } from "../middlewares/auth.js";
import { sendMessage, getMessages, getLastMessage, markAsRead } from "../controllers/messageController.js";

const router = express.Router();

// Enviar un mensaje
router.post("/", auth, sendMessage);

// Obtener mensajes de un usuario específico
router.get("/:otherUserId", auth, getMessages);

// Obtener último mensaje
router.get("/last/:otherUserId", auth, getLastMessage);

// Marcar mensajes como leídos
router.post("/mark-as-read", auth, markAsRead);

export default router;
