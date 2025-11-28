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
router.put("/me/edit", auth, editProfile);

router.get("/match/list", auth, listUsersForMatch);


/* =====================================================
   RUTAS DE ADMINISTRADOR
===================================================== */

router.get("/admin/all-users", auth, isAdmin, adminGetUsers);

router.put("/admin/block/:id", auth, isAdmin, adminBlockUser);

router.put("/admin/activate/:id", auth, isAdmin, adminActivateUser);

router.delete("/admin/delete/:id", auth, isAdmin, adminDeleteUser);

export default router;
