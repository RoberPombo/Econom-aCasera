import { serve } from "bun";
import path from "path";
import { existsSync, readFileSync } from "fs";
import * as XLSX from "xlsx";
import {
  getCurrentYear,
  setCurrentYear,
  getCurrentMonth,
  setCurrentMonth,
  getViewMode,
  setViewMode,
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getCategories,
  getMonthlySummary,
  getAnnualSummary,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  dbPath,
} from "./db";
import {
  getDriveConfig,
  setDriveConfig,
  getDriveStatus,
  startGoogleAuth,
  backupToDrive,
  restoreFromDrive,
} from "./drive";
import { Transaction, DriveConfig } from "./types";
import { getStaticDir } from "./utils";

const distDir = getStaticDir();
const PORT = Number(process.env.PORT || 1420);

const monthNames = ["Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.", "Jul.", "Ago.", "Sep.", "Oct.", "Nov.", "Dic."];

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

async function importExcel(file: File): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });

  for (const sheetName of workbook.SheetNames) {
    const monthIndex = monthNames.findIndex((m) => m.toLowerCase() === sheetName.toLowerCase());
    if (monthIndex === -1) continue;
    const month = monthIndex + 1;

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];

    // Buscar la fila de cabecera de transacciones
    let headerRow = -1;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (String(row[1]).includes("INGRESO / GASTO") && String(row[6]).includes("DIA")) {
        headerRow = i;
        break;
      }
    }

    if (headerRow === -1) {
      errors.push(`Hoja ${sheetName}: no se encontró la cabecera de transacciones`);
      continue;
    }

    const year = 2016; // Por defecto del nombre del archivo

    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i];
      const category = String(row[1] || "").trim();
      const tipo = String(row[2] || "").trim();
      const dia = Number(row[6]);
      const mes = Number(row[8] || month);
      const anio = Number(row[10] || year);
      const euros = Number(row[11]);
      const descripcion = String(row[13] || "").trim();

      if (!category || isNaN(euros) || euros === 0) continue;

      const type =
        tipo.toLowerCase().includes("ingreso") ||
        ["Nóminas", "Ingresos por intereses", "Dividendos", "Ganancias patrimoniales", "Becas y subvenciones", "Ingresos extraordinarios", "Apuestas y juego", "Bonificaciones"].includes(category)
          ? "income"
          : "expense";

      const day = isNaN(dia) || dia < 1 || dia > 31 ? 1 : dia;
      const monthNum = isNaN(mes) || mes < 1 || mes > 12 ? month : mes;
      const yearNum = isNaN(anio) || anio < 2000 ? year : anio;
      const date = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      try {
        createTransaction({
          date,
          type,
          category,
          concept: descripcion || category,
          amount: Math.abs(euros),
          year: yearNum,
          month: monthNum,
        });
        imported++;
      } catch (e) {
        errors.push(`Hoja ${sheetName}, fila ${i + 1}: ${String(e)}`);
      }
    }
  }

  return { imported, errors };
}

async function apiHandler(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === "/api/transactions") {
    if (req.method === "GET") {
      const year = Number(url.searchParams.get("year"));
      const month = url.searchParams.get("month");
      return Response.json(listTransactions(year, month ? Number(month) : undefined));
    }
    if (req.method === "POST") {
      const body = (await req.json()) as Transaction;
      return Response.json(createTransaction(body));
    }
  }

  if (pathname.startsWith("/api/transactions/")) {
    const id = Number(pathname.split("/").pop());
    if (req.method === "PUT") {
      const body = (await req.json()) as Transaction;
      body.id = id;
      return Response.json(updateTransaction(body));
    }
    if (req.method === "DELETE") {
      deleteTransaction(id);
      return Response.json({ ok: true });
    }
  }

  if (pathname === "/api/summary") {
    const year = Number(url.searchParams.get("year"));
    const month = url.searchParams.get("month");
    return Response.json(getSummary(year, month ? Number(month) : undefined));
  }

  if (pathname === "/api/categories") {
    const year = Number(url.searchParams.get("year"));
    const month = url.searchParams.get("month");
    return Response.json(getCategories(year, month ? Number(month) : undefined));
  }

  if (pathname === "/api/monthly-summary") {
    const year = Number(url.searchParams.get("year"));
    return Response.json(getMonthlySummary(year));
  }

  if (pathname === "/api/annual-summary") {
    return Response.json(getAnnualSummary());
  }

  if (pathname === "/api/year") {
    if (req.method === "GET") return Response.json({ year: getCurrentYear() });
    if (req.method === "POST") {
      const { year } = (await req.json()) as { year: number };
      setCurrentYear(year);
      return Response.json({ year });
    }
  }

  if (pathname === "/api/month") {
    if (req.method === "GET") return Response.json({ month: getCurrentMonth() });
    if (req.method === "POST") {
      const { month } = (await req.json()) as { month: number };
      setCurrentMonth(month);
      return Response.json({ month });
    }
  }

  if (pathname === "/api/view-mode") {
    if (req.method === "GET") return Response.json({ mode: getViewMode() });
    if (req.method === "POST") {
      const { mode } = (await req.json()) as { mode: "monthly" | "annual" };
      setViewMode(mode);
      return Response.json({ mode });
    }
  }

  if (pathname === "/api/category-config") {
    if (req.method === "GET") return Response.json(listCategories());
    if (req.method === "POST") {
      const { name, type } = (await req.json()) as { name: string; type: "income" | "expense" };
      return Response.json(createCategory(name, type));
    }
  }

  if (pathname.startsWith("/api/category-config/")) {
    const id = Number(pathname.split("/").pop());
    if (req.method === "PUT") {
      const { name, type, active } = (await req.json()) as { name: string; type: "income" | "expense"; active: number };
      updateCategory(id, name, type, active);
      return Response.json({ ok: true });
    }
    if (req.method === "DELETE") {
      deleteCategory(id);
      return Response.json({ ok: true });
    }
  }

  if (pathname === "/api/drive/status") {
    return Response.json(await getDriveStatus());
  }

  if (pathname === "/api/drive/config") {
    if (req.method === "POST") {
      const cfg = (await req.json()) as DriveConfig;
      setDriveConfig(cfg);
      return Response.json({ ok: true });
    }
    return Response.json(getDriveConfig());
  }

  if (pathname === "/api/drive/auth") {
    const url = await startGoogleAuth();
    return Response.json({ url });
  }

  if (pathname === "/api/drive/backup") {
    const result = await backupToDrive(dbPath);
    return Response.json(result);
  }

  if (pathname === "/api/drive/restore") {
    const result = await restoreFromDrive(dbPath);
    return Response.json(result);
  }

  if (pathname === "/api/dbpath") {
    return Response.json({ path: dbPath });
  }

  if (pathname === "/api/import/excel" && req.method === "POST") {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ error: "No file provided" }, { status: 400 });
    const result = await importExcel(file);
    return Response.json(result);
  }

  return null;
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/api/")) {
    try {
      const res = await apiHandler(req);
      if (res) return res;
    } catch (err) {
      return Response.json({ error: String(err) }, { status: 500 });
    }
  }

  let filePath = path.join(distDir, url.pathname === "/" ? "index.html" : url.pathname);
  if (url.pathname === "/") {
    const res = serveStatic(filePath);
    if (res) return res;
  }

  let res = serveStatic(filePath);
  if (res) return res;

  filePath = path.join(distDir, "index.html");
  res = serveStatic(filePath);
  if (res) return res;

  return new Response("Not found", { status: 404 });
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

console.log(`Iniciando servidor en http://127.0.0.1:${PORT}`);
serve({ port: PORT, fetch: handler });

setTimeout(openBrowser, 800);

process.on("SIGINT", () => {
  console.log("\nCerrando servidor...");
  process.exit(0);
});
