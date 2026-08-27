# Vite Preview HMR Validation

Date: 2026-08-22

The preview server hosts Vite in middleware mode on port 3000, while the Vite client previously generated a direct fallback target at `localhost:5173`. This did not match the running server and caused the reported HMR WebSocket failure.

The middleware Vite configuration now declares port 3000 while allowing each browser URL to select its own WebSocket protocol and port. As a result, HTTP local previews use `ws` on their origin, while HTTPS proxied previews use `wss` on their origin rather than a fixed incompatible endpoint.

After the final restart, the generated Vite runtime reported `serverHost = "localhost:3000/"`, no fixed HMR port, and protocol selection based on the current URL. The preview rendered successfully and no Vite WebSocket failure was logged after the restart.
