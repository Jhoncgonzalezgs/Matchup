import nodemailer from "nodemailer";

// CONFIGURACIÓN SMTP REAL (opcional)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "tu_correo@gmail.com",
        pass: "tu_contraseña_app"
    }
});

export const sendEmail = async (to, subject, html) => {
    try {
        // Email real (si configuraste SMTP)
        const mailOptions = {
            from: "MatchUp <no-reply@matchup.com>",
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);

        console.log("Email enviado a:", to);
        return true;

    } catch (error) {
        // Email simulado
        console.log("Email simulado →", { to, subject });
        console.log("(Configura SMTP para envío real)");
        return false;
    }
};
