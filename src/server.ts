import { serve } from "bun";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { AppContainer } from "./application/AppContainer";
import { HttpRouter } from "./presentation/routes";
import { StorageLocator } from "./infrastructure/storage/StorageLocator";

const PORT = Number(process.env.PORT || 1420);
const staticDir = new StorageLocator().getStaticDir();

function serveStatic(filePath: string): Response | null {
  try {
    if (!existsSync(filePath)) return null;
    const content = readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime: Record<string, string> = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".mjs": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".woff2": "font/woff2",
    };
    return new Response(content, {
      headers: { "Content-Type": mime[ext] || "application/octet-stream" },
    });
  } catch {
    return null;
  }
}

async function openBrowser() {
  const platform = process.platform;
  const url = `http://127.0.0.1:${PORT}`;
  try {
    if (platform === "win32") {
      await Bun.spawn(["cmd", "/c", "start", url]).exited;
    } else if (platform === "darwin") {
      await Bun.spawn(["open", url]).exited;
    } else {
      await Bun.spawn(["xdg-open", url]).exited;
    }
  } catch (e) {
    console.log("No se pudo abrir el navegador automáticamente:", e);
  }
}

async function main() {
  const container = new AppContainer();
  const router = new HttpRouter(container);
  const info = container.getDbInfo();

  console.log(`Iniciando servidor en http://127.0.0.1:${PORT}`);
  if (info.usesDrive) {
    console.log(`Base de datos en Google Drive: ${info.dbPath}`);
    console.log(`Copia de seguridad local: ${info.backupPath}`);
  } else {
    console.log(`Base de datos local: ${info.dbPath}`);
    console.log(`Copia de seguridad local: ${info.backupPath}`);
  }

  serve({
    port: PORT,
    async fetch(req) {
      const url = new URL(req.url);

      if (url.pathname.startsWith("/api/")) {
        try {
          const res = await router.handle(req);
          if (res) return res;
        } catch (err) {
          return Response.json({ error: String(err) }, { status: 500 });
        }
      }

      let filePath = path.join(staticDir, url.pathname === "/" ? "index.html" : url.pathname);
      if (url.pathname === "/") {
        const res = serveStatic(filePath);
        if (res) return res;
      }

      let res = serveStatic(filePath);
      if (res) return res;

      filePath = path.join(staticDir, "index.html");
      res = serveStatic(filePath);
      if (res) return res;

      return new Response("Not found", { status: 404 });
    },
  });

  setTimeout(openBrowser, 800);
}

main();

process.on("SIGINT", () => {
  console.log("\nCerrando servidor...");
  process.exit(0);
});
