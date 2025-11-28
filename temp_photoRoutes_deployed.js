import express from "express";
import { upload } from "../middlewares/upload.js";
import { auth } from "../middlewares/auth.js";
import { uploadPhoto, getMyPhotos, getUserPhotos, deletePhoto } from "../controllers/photoController.js";

const router = express.Router();

/**
 * @openapi
 * /photos:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Subir foto (multipart/form-data)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen subida correctamente
 */
// Subir foto (solo 1 por vez)
router.post("/", auth, upload.single("photo"), uploadPhoto);

/**
router.post("/", auth, upload.single("photo"), uploadPhoto);
 * /photos/my-photos:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener mis fotos
 *     responses:
 *       200:
 *         description: Lista de fotos del usuario
 */
// Obtener mis fotos
router.get("/my-photos", auth, getMyPhotos);

router.get("/my-photos", auth, getMyPhotos);
 * @openapi
 * /photos/user/{id}:
 *   get:
 *     summary: Obtener fotos de otro usuario (público)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de fotos del usuario
 */
// Obtener fotos de otro usuario (público)
router.get("/user/:id", getUserPhotos);
router.get("/user/:id", getUserPhotos);
/**
 * @openapi
 * /photos/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Eliminar una foto propia
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Foto eliminada correctamente
 */
// Eliminar una foto propia
router.delete("/:id", auth, deletePhoto);

export default router;
