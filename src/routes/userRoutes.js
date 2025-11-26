import express from "express";
import { 
    getMyProfile,
    editProfile,
    getUserProfile,
    searchUsers,
    listUsersForMatch,
    adminGetUsers,
    adminBlockUser,
    adminActivateUser,
    adminDeleteUser
} from "../controllers/userController.js";

import { auth } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

/* =====================================================
   RUTAS PÚBLICAS (ANÓNIMOS PUEDEN ACCEDER)
===================================================== */

// Buscar perfiles públicos (solo descripción)
router.get("/search", searchUsers);

// Obtener perfil de otro usuario
router.get("/:id", getUserProfile);


/* =====================================================
   RUTAS DE USUARIO AUTENTICADO
===================================================== */

// Obtener mi perfil
router.get("/me/profile", auth, getMyProfile);

// Editar mi perfil personal
router.put("/me/edit", auth, editProfile);

// Listar usuarios disponibles para match
router.get("/match/list", auth, listUsersForMatch);


/* =====================================================
   RUTAS DE ADMINISTRADOR
===================================================== */

// Ver todos los usuarios
router.get("/admin/all-users", auth, isAdmin, adminGetUsers);

// Bloquear usuario
router.put("/admin/block/:id", auth, isAdmin, adminBlockUser);

// Activar/Desbloquear usuario
router.put("/admin/activate/:id", auth, isAdmin, adminActivateUser);

// Eliminar usuario
router.delete("/admin/delete/:id", auth, isAdmin, adminDeleteUser);

export default router;
