import express from "express";
import { upload } from "../middlewares/upload.js";
import { auth } from "../middlewares/auth.js";
import { uploadPhoto, getMyPhotos, getUserPhotos, deletePhoto } from "../controllers/photoController.js";

const router = express.Router();

// Subir foto (solo 1 por vez)
router.post("/", auth, upload.single("photo"), uploadPhoto);

// Obtener mis fotos
router.get("/my-photos", auth, getMyPhotos);

// Obtener fotos de otro usuario (público)
router.get("/user/:id", getUserPhotos);

// Eliminar una foto propia
router.delete("/:id", auth, deletePhoto);

export default router;
