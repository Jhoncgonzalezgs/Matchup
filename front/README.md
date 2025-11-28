# MatchUp Android Frontend (Kotlin + Compose)

Este directorio contiene una aplicación Android en Kotlin usando Jetpack Compose que consume la API de MatchUp.

Requerimientos:

- Android Studio Arctic Fox o superior
- Kotlin 1.9+

Cómo abrir:

1. Abrir el directorio `front` en Android Studio.
2. Configurar en `MainActivity.kt` la `BASE_URL` si requieres otro host.
3. Ejecutar la app en el emulador (el emulador usa `10.0.2.2` para `localhost` del host).

Features implementadas:

- Login / Registro
- Perfil (ver / editar)
- Buscar usuarios
- Lista de matches
- Chat en tiempo real usando WebSockets (OkHttp) conectado a `/ws` en el backend
- Subida de foto (selección desde galería y multipart upload)

Notas:

- Asegúrate de que el backend esté corriendo y accesible desde el emulador.
- Si utilizas un dispositivo físico, ajusta el `BASE_URL` en `ApiClient.kt` al host accesible.
