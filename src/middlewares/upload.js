import multer from "multer";
import path from "path";

// Directorio donde se guardan las fotos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uniqueName + ext);
    }
});

// Validación de archivo (solo imágenes)
const fileFilter = (req, file, cb) => {
    const allowedExt = /\.(jpg|jpeg|png)$/;

    if (!allowedExt.test(file.originalname.toLowerCase())) {
        return cb(
            new multer.MulterError(
                "LIMIT_UNEXPECTED_FILE",
                "Solo se permiten imágenes JPG o PNG"
            )
        );
    }

    cb(null, true);
};

// Configuración final de multer
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
