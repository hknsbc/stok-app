import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
    async configureServer(server) {
      // Dynamically import server only in dev mode to avoid build errors
      const { createServer } = await import("./server/index");
      const app = createServer();

      return () => {
        const apiMiddleware = (req: any, res: any, next: any) => {
          if (req.url.startsWith("/api/") || req.url.startsWith("/auth/")) {
            app(req, res, next);
          } else {
            next();
          }
        };

        server.middlewares.stack.unshift({
          route: "",
          handle: apiMiddleware,
        });
      };
    },
  };
}
