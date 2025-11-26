export const emailTemplates = {
    confirmAccount: (token) => `
        <h2>Confirma tu cuenta en MatchUp</h2>
        <p>Haz clic en el enlace para activar tu cuenta:</p>
        <a href="http://localhost:3000/users/confirm/${token}">Confirmar cuenta</a>
    `,

    recoverPassword: (token) => `
        <h2>Restablecer contraseña</h2>
        <p>Usa este enlace para crear una nueva contraseña:</p>
        <a href="http://localhost:3000/users/recover/${token}">
            Recuperar contraseña
        </a>
    `
};
