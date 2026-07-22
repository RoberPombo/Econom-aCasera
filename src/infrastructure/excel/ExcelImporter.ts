import * as XLSX from "xlsx";
import type { Transaction } from "../../domain/entities";

export interface ExcelImportResult {
  imported: number;
  errors: string[];
  transactions: Transaction[];
}

export class ExcelImporter {
  private readonly monthNames = ["Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.", "Jul.", "Ago.", "Sep.", "Oct.", "Nov.", "Dic."];

  import(buffer: ArrayBuffer): ExcelImportResult {
    const errors: string[] = [];
    const transactions: Transaction[] = [];
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });

    for (const sheetName of workbook.SheetNames) {
      const monthIndex = this.monthNames.findIndex((m) => m.toLowerCase() === sheetName.toLowerCase());
      if (monthIndex === -1) continue;
      const month = monthIndex + 1;

      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];

      const headerRow = this.findHeaderRow(data);
      if (headerRow === -1) {
        errors.push(`Hoja ${sheetName}: no se encontró la cabecera de transacciones`);
        continue;
      }

      const year = 2016;

      for (let i = headerRow + 1; i < data.length; i++) {
        const row = data[i];
        const tx = this.parseRow(row, month, year);
        if (tx) transactions.push(tx);
      }
    }

    return { imported: transactions.length, errors, transactions };
  }

  private findHeaderRow(data: any[][]): number {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (String(row[1]).includes("INGRESO / GASTO") && String(row[6]).includes("DIA")) {
        return i;
      }
    }
    return -1;
  }

  private parseRow(row: any[], defaultMonth: number, defaultYear: number): Transaction | null {
    const category = String(row[1] || "").trim();
    const tipo = String(row[2] || "").trim();
    const dia = Number(row[6]);
    const mes = Number(row[8] || defaultMonth);
    const anio = Number(row[10] || defaultYear);
    const euros = Number(row[11]);
    const descripcion = String(row[13] || "").trim();

    if (!category || isNaN(euros) || euros === 0) return null;

    const type =
      tipo.toLowerCase().includes("ingreso") ||
      ["Nóminas", "Ingresos por intereses", "Dividendos", "Ganancias patrimoniales", "Becas y subvenciones", "Ingresos extraordinarios", "Apuestas y juego", "Bonificaciones"].includes(category)
        ? "income"
        : "expense";

    const day = isNaN(dia) || dia < 1 || dia > 31 ? 1 : dia;
    const month = isNaN(mes) || mes < 1 || mes > 12 ? defaultMonth : mes;
    const year = isNaN(anio) || anio < 2000 ? defaultYear : anio;
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return {
      date,
      type,
      category,
      concept: descripcion || category,
      amount: Math.abs(euros),
      year,
      month,
    };
  }
}
