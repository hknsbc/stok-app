import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      const app = createServer();

      // Add a middleware that intercepts /api/* and /auth/* routes
      return () => {
        // Middleware to pass API requests to Express
        const apiMiddleware = (req: any, res: any, next: any) => {
          if (req.url.startsWith("/api/") || req.url.startsWith("/auth/")) {
            console.log("[Vite] Routing to Express:", req.method, req.url);
            // Call Express app with all three arguments
            app(req, res, next);
          } else {
            next();
          }
        };

        // Insert at the BEGINNING of middleware stack using unshift
        server.middlewares.stack.unshift({
          route: "",
          handle: apiMiddleware,
        });
      };
    },
  };
}
