import express from "express";
import { auth } from "../middlewares/auth.js";
import { giveLike, getMatches, removeMatch } from "../controllers/matchController.js";

const router = express.Router();

// Dar like a un usuario
router.post("/like", auth, giveLike);

// Obtener todos los matches del usuario autenticado
router.get("/", auth, getMatches);

// Eliminar un match
router.delete("/:otherUserId", auth, removeMatch);

export default router;
