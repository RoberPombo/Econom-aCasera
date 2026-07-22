import type { AppContainer } from "../application/AppContainer";
import { ConflictError } from "../infrastructure/sync/SyncTracker";
import { TransactionController } from "./controllers/TransactionController";
import { CategoryController } from "./controllers/CategoryController";
import { SettingsController } from "./controllers/SettingsController";
import { DbController } from "./controllers/DbController";
import { ImportController } from "./controllers/ImportController";
import type { Transaction } from "../domain/entities";

export class HttpRouter {
  private readonly transactionController: TransactionController;
  private readonly categoryController: CategoryController;
  private readonly settingsController: SettingsController;
  private readonly dbController: DbController;
  private readonly importController: ImportController;

  constructor(private readonly container: AppContainer) {
    this.transactionController = new TransactionController(container);
    this.categoryController = new CategoryController(container);
    this.settingsController = new SettingsController(container);
    this.dbController = new DbController(container);
    this.importController = new ImportController(container);
  }

  async handle(req: Request): Promise<Response | null> {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    try {
      if (pathname === "/api/transactions") {
        if (method === "GET") {
          const year = Number(url.searchParams.get("year"));
          const month = url.searchParams.get("month");
          return this.transactionController.list(year, month ? Number(month) : undefined);
        }
        if (method === "POST") {
          const body = (await req.json()) as Transaction;
          return this.transactionController.create(body);
        }
      }

      if (pathname.startsWith("/api/transactions/")) {
        const id = Number(pathname.split("/").pop());
        if (method === "PUT") {
          const body = (await req.json()) as Transaction;
          return this.transactionController.update(id, body);
        }
        if (method === "DELETE") {
          return this.transactionController.delete(id);
        }
      }

      if (pathname === "/api/summary") {
        const year = Number(url.searchParams.get("year"));
        const month = url.searchParams.get("month");
        return this.transactionController.summary(year, month ? Number(month) : undefined);
      }

      if (pathname === "/api/categories") {
        const year = Number(url.searchParams.get("year"));
        const month = url.searchParams.get("month");
        return this.transactionController.categories(year, month ? Number(month) : undefined);
      }

      if (pathname === "/api/monthly-summary") {
        const year = Number(url.searchParams.get("year"));
        return this.transactionController.monthlySummary(year);
      }

      if (pathname === "/api/annual-summary") {
        return this.transactionController.annualSummary();
      }

      if (pathname === "/api/year" && method === "GET") {
        return this.settingsController.getYear();
      }

      if (pathname === "/api/year" && method === "POST") {
        const { year } = (await req.json()) as { year: number };
        return this.settingsController.year(year);
      }

      if (pathname === "/api/month" && method === "GET") {
        return this.settingsController.getMonth();
      }

      if (pathname === "/api/month" && method === "POST") {
        const { month } = (await req.json()) as { month: number };
        return this.settingsController.month(month);
      }

      if (pathname === "/api/view-mode" && method === "GET") {
        return this.settingsController.getViewMode();
      }

      if (pathname === "/api/view-mode" && method === "POST") {
        const { mode } = (await req.json()) as { mode: "monthly" | "annual" };
        return this.settingsController.viewMode(mode);
      }

      if (pathname === "/api/theme" && method === "GET") {
        return this.settingsController.getTheme();
      }

      if (pathname === "/api/theme" && method === "POST") {
        const { theme } = (await req.json()) as { theme: "light" | "dark" | "system" };
        return this.settingsController.theme(theme);
      }

      if (pathname === "/api/category-config" && method === "GET") {
        return this.categoryController.list();
      }

      if (pathname === "/api/category-config" && method === "POST") {
        const { name, type } = (await req.json()) as { name: string; type: "income" | "expense" };
        return this.categoryController.create(name, type);
      }

      if (pathname.startsWith("/api/category-config/")) {
        const id = Number(pathname.split("/").pop());
        if (method === "PUT") {
          const { name, type, active } = (await req.json()) as { name: string; type: "income" | "expense"; active: number };
          return this.categoryController.update(id, name, type, active);
        }
        if (method === "DELETE") {
          return this.categoryController.delete(id);
        }
      }

      if (pathname === "/api/db-info") {
        return this.dbController.info();
      }

      if (pathname === "/api/db/reload" && method === "POST") {
        return this.dbController.reload();
      }

      if (pathname === "/api/db/force-overwrite" && method === "POST") {
        return this.dbController.forceOverwrite();
      }

      if (pathname === "/api/import/excel" && method === "POST") {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) return Response.json({ error: "No file provided" }, { status: 400 });
        return this.importController.excel(file);
      }
    } catch (err) {
      if (err instanceof ConflictError) {
        return Response.json({ conflict: true, message: err.message }, { status: 409 });
      }
      throw err;
    }

    return null;
  }
}
