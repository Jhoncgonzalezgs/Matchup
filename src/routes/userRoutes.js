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

/**
 * @openapi
 * /users/search:
 *   get:
 *     summary: Buscar usuarios por descripción o email
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Termino de búsqueda
 *     responses:
 *       200:
 *         description: Lista de usuarios coincidentes
 */
// Buscar perfiles públicos (solo descripción)
router.get("/search", searchUsers);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Obtener perfil público de un usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Perfil público del usuario
 */
// Obtener perfil de otro usuario
router.get("/:id", getUserProfile);


/* =====================================================
   RUTAS DE USUARIO AUTENTICADO
===================================================== */

/**
 * @openapi
 * /users/me/profile:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener el perfil del usuario autenticado
 *     responses:
 *       200:
 *         description: Perfil del usuario
 */
// Obtener mi perfil
router.get("/me/profile", auth, getMyProfile);

/**
 * @openapi
 * /users/me/edit:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Editar el perfil del usuario autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               chatLink:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
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
