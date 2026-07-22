import type { AppContainer } from "../../application/AppContainer";
import { ExcelImporter } from "../../infrastructure/excel/ExcelImporter";

export class ImportController {
  private readonly excelImporter = new ExcelImporter();

  constructor(private readonly container: AppContainer) {}

  async excel(file: File): Promise<Response> {
    const buffer = await file.arrayBuffer();
    const result = this.excelImporter.import(buffer);

    for (const tx of result.transactions) {
      this.container.checkConflict();
      this.container.transactionUseCases.create(tx);
      this.container.afterWrite();
    }

    return Response.json({ imported: result.imported, errors: result.errors });
  }
}
