import express from "express";
import { listUsers, blockUser } from "../controllers/adminController.js";
import { auth } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// SOLO ADMIN → ver lista de usuarios
router.get("/users", auth, isAdmin, listUsers);

// SOLO ADMIN → bloquear / desbloquear usuarios
router.post("/block", auth, isAdmin, blockUser);

export default router;
