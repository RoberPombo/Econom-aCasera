import { describe, expect, test } from "vitest";
import { type ExcelCell, parseIngExcel } from "../parsers/ingParser";

const headerRow: ExcelCell[] = [
  "F. VALOR",
  "CATEGORÍA",
  "SUBCATEGORÍA",
  "DESCRIPCIÓN",
  "COMENTARIO",
  "IMPORTE (€)",
  "SALDO (€)",
];

describe("parseIngExcel", () => {
  test("parses rows from the ING export grid", () => {
    const rows: ExcelCell[][] = [
      [
        "Movimientos de la Cuenta",
        "",
        "Número de cuenta:",
        "1465 0100 9917 14421211",
        "",
        "",
        "",
      ],
      headerRow,
      [
        "2026-08-06",
        "Alimentación",
        "Supermercados",
        "Pago en MERCADONA A CORUA ES",
        "",
        -34.5,
        3712.78,
      ],
      [
        "2026-08-05",
        "Otros gastos",
        "Transferencias",
        "Ingreso nómina",
        "",
        1500.0,
        3747.28,
      ],
    ];

    const result = parseIngExcel(rows);

    expect(result.errors).toEqual([]);
    expect(result.transactions).toHaveLength(2);

    const [expense, income] = result.transactions;
    expect(expense.date).toBe("2026-08-06");
    expect(expense.type).toBe("expense");
    expect(expense.category).toBe("Comida");
    expect(expense.concept).toBe("Pago en MERCADONA A CORUA ES");
    expect(expense.amount).toBe(34.5);

    expect(income.type).toBe("income");
    expect(income.category).toBe("Nómina");
    expect(income.amount).toBe(1500);
  });

  test("returns an error when the header row is missing", () => {
    const result = parseIngExcel([
      ["foo", "bar"],
      ["x", "y"],
    ]);

    expect(result.transactions).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/cabecera/i);
  });

  test("parses dd/MM/yyyy dates", () => {
    const rows: ExcelCell[][] = [
      headerRow,
      ["06/08/2026", "Hogar", "Comunidad", "Comunidad", "", -75.0, 1200],
    ];

    const result = parseIngExcel(rows);

    expect(result.transactions[0].date).toBe("2026-08-06");
  });

  test("parses amounts with comma decimals", () => {
    const rows: ExcelCell[][] = [
      headerRow,
      ["2026-08-06", "Alimentación", "", "Panadería", "", "-12,50", 500],
    ];

    const result = parseIngExcel(rows);

    expect(result.transactions[0].amount).toBe(12.5);
  });

  test("skips empty rows", () => {
    const rows: ExcelCell[][] = [headerRow, ["", "", "", "", "", "", ""]];

    const result = parseIngExcel(rows);

    expect(result.transactions).toHaveLength(0);
  });

  test("maps the remaining ING categories", () => {
    const rows: ExcelCell[][] = [
      headerRow,
      ["2026-08-06", "Vehículo y transporte", "", "Gasolina", "", -50, 1000],
      ["2026-08-07", "Ocio y viajes", "", "Cine", "", -12, 988],
      ["2026-08-08", "Hogar", "", "Comunidad", "", -75, 913],
      ["2026-08-09", "Otros gastos", "", "Gastos varios", "", -20, 893],
    ];

    const result = parseIngExcel(rows);

    expect(result.transactions.map((t) => t.category)).toEqual([
      "Transporte",
      "Ocio",
      "Hogar",
      "Hogar",
    ]);
  });

  test("reports rows with an invalid date as errors", () => {
    const rows: ExcelCell[][] = [
      headerRow,
      ["2026-99-99", "Hogar", "", "Comunidad", "", -75, 1200],
      ["2026-08-06", "Hogar", "", "Comunidad", "", -75, 1125],
    ];

    const result = parseIngExcel(rows);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/Fila 2/i);
    expect(result.transactions).toHaveLength(1);
  });

  test("skips rows whose amount is not a number", () => {
    const rows: ExcelCell[][] = [
      headerRow,
      ["2026-08-06", "Hogar", "", "Comunidad", "", true, 1000],
      ["2026-08-06", "Hogar", "", "Comunidad", "", 500, 1500],
    ];

    const result = parseIngExcel(rows);

    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(500);
  });
});
