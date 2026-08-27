# Secure Preview HMR Validation

Date: 2026-08-23

The renewed error showed the Vite client attempting an HMR WebSocket fallback through `localhost:3000`, while the browser loaded the app through the managed HTTPS preview proxy. The middleware Vite configuration now explicitly uses secure WebSockets and public port 443 for the HMR client while continuing to attach the HMR server to the existing port-3000 HTTP server.

The active Vite client reports `socketProtocol = "wss"` and `hmrPort = 443`. The affected public preview loaded through its managed HTTPS URL after restart, and its browser console contained no Vite WebSocket error output.
