import express from "express";
import { auth } from "../middlewares/auth.js";
import { giveLike, getMatches, removeMatch } from "../controllers/matchController.js";

const router = express.Router();

/**
 * @openapi
 * /match/like:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Dar like a usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toUserId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Like enviado o Match detectado
 */
router.post("/like", auth, giveLike);

/**
 * @openapi
 * /match:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener lista de matches (mutuos)
 *     responses:
 *       200:
 *         description: Lista de matches
 */
router.get("/", auth, getMatches);

/**
 * @openapi
 * /match/{otherUserId}:
 *   delete:
 *     summary: Eliminar match con otro usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Match eliminado correctamente
 */
router.delete("/:otherUserId", auth, removeMatch);

export default router;
