# Android Demo for MatchUp Backend

This is a simple Android Studio project to test the `matchup_backend` API from the `android-demo` folder. It shows two modes:

- Native Kotlin UI (login / register / get profile)
- WebView – loads the demo frontend (no need to rewrite the UI, remote or embedded)

## How to use

### 1) Prepare backend
- Run backend on your machine (dev). From the repo root:

```pwsh
npm run migrate
npm start
```

- Confirm the backend is reachable: `http://localhost:3000/` or Swagger at `http://localhost:3000/docs`.

### 2) Import project in Android Studio
- Open `android-demo` as an existing project in Android Studio.
- Build requirements: Android Studio recommended version with SDK 34.

### 3) Run on AVD
- The debug `BuildConfig.API_BASE_URL` is `http://10.0.2.2:3000/` (AVD loopback to host). No code changes required to talk to local backend.
- Run the app on the emulator. Use the `Login` or `Register` fields.

### 4) Run in device
- Set `BuildConfig.API_BASE_URL` to `http://<your-pc-ip>:3000/` in `app/build.gradle` debug config if necessary. Use your local host IP reachable by the device.
- Ensure firewall allows inbound traffic on port 3000.

### 5) WebView mode
- Tap *Open WebView* in the app to load the demo frontend hosted at `http://10.0.2.2:3000/`.
- If you want to load the embedded assets in the app, change `WebViewActivity` base to `file:///android_asset/index.html` or `loadDataWithBaseURL` and optionally inject `window.BASE_API_URL`.

## Notes
- For production, point `BuildConfig.API_BASE_URL` release value to your hosted backend (Render or other), and ensure HTTPS.
- The `AndroidManifest.xml` includes `INTERNET` permission and `network_security_config` allowing `10.0.2.2` and `10.0.3.2` for emulators.
- For security: use `EncryptedSharedPreferences` to store tokens.

Enjoy testing! If you want, I can now adjust the project to build with a Gradle wrapper or generate a debug/release keystore and proguard files.
