import app from "../server/_core/app";

// Vercel Functions require an exported request handler. This imports the same
// application used by the managed runtime without opening another listener.
export default app;
