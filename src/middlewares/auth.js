import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    // Espera formato: Bearer TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token mal formado" });
    }

    // try {
    //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //     // El token contiene: { id, role }
    //     req.user = {
    //         id: decoded.id,
    //         role: decoded.role
    //     };

    //     next();
    // } 
    catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
