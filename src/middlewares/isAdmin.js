export const isAdmin = (req, res, next) => {
    // Validar que el usuario esté autenticado
    if (!req.user) {
        return res.status(401).json({ error: "No autenticado" });
    }

    // Validar el rol del usuario
    if (!req.user.role || req.user.role !== "admin") {
        return res.status(403).json({ error: "Acceso denegado: solo administradores" });
    }

    next();
};
