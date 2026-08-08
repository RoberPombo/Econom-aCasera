import { describe, expect, test } from "vitest";
import { type ExcelSheet, parseExcelSheets } from "../excelParser";

function row(
  cells: Record<number, string | number | null>,
): (string | number | null)[] {
  const max = Math.max(0, ...Object.keys(cells).map(Number));
  const result: (string | number | null)[] = new Array(max + 1).fill(null);
  for (const [index, value] of Object.entries(cells)) {
    result[Number(index)] = value;
  }
  return result;
}

function monthlyPage(name: string, dataRows: (string | number | null)[][]) {
  return {
    sheet: name,
    data: [row({ 0: "" }), ...dataRows],
  };
}

const header = row({
  1: "INGRESO / GASTO",
  2: "TIPO",
  6: "DIA",
  7: "MES",
  9: "AÑO",
  10: "EUROS",
  13: "DESCRIPCIÓN",
});

const realEne = monthlyPage("Ene.", [
  header,
  row({
    0: "Ingreso Nóminas 1-ENERO-2017 1200",
    1: "Ingreso",
    2: "Nóminas",
    6: 1,
    7: "ENERO",
    9: 2017,
    10: 1200,
    28: 1200,
  }),
  row({
    0: "Gasto Alimentación 1-ENERO-2017",
    1: "Gasto",
    2: "Alimentación",
    6: 1,
    7: "ENERO",
    9: 2017,
    28: 0,
  }),
  row({ 0: "--", 28: 0 }),
]);

function globalPage(): ExcelSheet {
  const data: (string | number | null)[][] = Array.from({ length: 15 }, () =>
    new Array(19).fill(null),
  );
  data[0][17] = "INGRESOS";
  data[0][18] = "GASTOS";
  data[1][17] = "Nóminas";
  data[1][18] = "Hipoteca / Alquiler / Seguros";
  data[2][17] = "Ingresos por intereses";
  data[2][18] = "Muebles / Menaje";
  data[3][17] = "Dividendos";
  data[3][18] = "Alimentación";
  data[4][17] = "Ganancias patrimoniales";
  data[4][18] = "Móvil / Internet / Fijo";
  data[5][17] = "Becas y subvenciones";
  data[5][18] = "Luz / Gas / Agua";
  data[6][17] = "Ingresos extraordinarios";
  data[6][18] = "Otros gastos casa";
  data[7][17] = "Apuestas y juego";
  data[7][18] = "Susana";
  data[8][17] = "Bonificaciones";
  data[8][18] = "Pedro";
  data[9][18] = "Aroa";
  data[10][18] = "Alonso";
  data[11][18] = "Carburantes";
  data[12][18] = "Otros gastos coche";
  data[13][18] = "Otros gastos";
  return { sheet: "Global", data };
}

describe("parseExcelSheets", () => {
  test("parses the monthly pages starting at row 21", () => {
    const result = parseExcelSheets([realEne], 2016);

    expect(result.errors).toEqual([]);
    expect(result.transactions).toHaveLength(1);

    const [income] = result.transactions;
    expect(income.date).toBe("2017-01-01");
    expect(income.type).toBe("income");
    expect(income.category).toBe("Nóminas");
    expect(income.concept).toBe("Ingreso Nóminas 1-ENERO-2017 1200");
    expect(income.amount).toBe(1200);
  });

  test("parses expenses that include an amount", () => {
    const sheet = monthlyPage("Feb.", [
      header,
      row({
        0: "Gasto Alimentación 3-FEBRERO-2017",
        1: "Gasto",
        2: "Alimentación",
        6: 3,
        7: "FEBRERO",
        9: 2017,
        10: 45.6,
      }),
    ]);

    const result = parseExcelSheets([sheet], 2016);

    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      date: "2017-02-03",
      type: "expense",
      category: "Alimentación",
      amount: 45.6,
    });
  });

  test("uses the description column when present", () => {
    const sheet = monthlyPage("Jul.", [
      header,
      row({
        0: "Gasto luz 5-JULIO-2017",
        1: "Gasto",
        2: "Luz / Gas / Agua",
        6: 5,
        7: 7,
        9: 2017,
        10: 56.5,
        13: "Recibo de la luz",
      }),
    ]);

    const result = parseExcelSheets([sheet], 2016);

    expect(result.transactions[0].concept).toBe("Recibo de la luz");
    expect(result.transactions[0].month).toBe(7);
  });

  test("skips empty rows marked with --", () => {
    const sheet = monthlyPage("Ene.", [
      header,
      row({ 0: "--", 1: null, 28: 0 }),
      row({
        0: "Gasto Alimentación 1-ENERO-2017",
        1: "Gasto",
        2: "Alimentación",
        6: 1,
        7: "ENERO",
        9: 2017,
        10: 45.6,
      }),
    ]);

    const result = parseExcelSheets([sheet], 2016);

    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].type).toBe("expense");
  });

  test("reads the amount from column L when K is empty", () => {
    const sheet = monthlyPage("Ene.", [
      header,
      row({
        0: "Gasto Alimentación 1-ENERO-2017",
        1: "Gasto",
        2: "Alimentación",
        6: 1,
        7: "ENERO",
        9: 2017,
        11: 45.6,
      }),
    ]);

    const result = parseExcelSheets([sheet], 2016);

    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(45.6);
    expect(result.transactions[0].type).toBe("expense");
  });

  test("reads the amount from column M when K and L are empty", () => {
    const sheet = monthlyPage("Ene.", [
      header,
      row({
        0: "Gasto Alimentación 1-ENERO-2017",
        1: "Gasto",
        2: "Alimentación",
        6: 1,
        7: "ENERO",
        9: 2017,
        12: 89.9,
      }),
    ]);

    const result = parseExcelSheets([sheet], 2016);

    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(89.9);
    expect(result.transactions[0].type).toBe("expense");
  });

  test("keeps expenses as positive amounts and lets the type carry the sign", () => {
    const sheet = monthlyPage("Ene.", [
      header,
      row({
        0: "Gasto Alimentación 1-ENERO-2017",
        1: "Gasto",
        2: "Alimentación",
        6: 1,
        7: "ENERO",
        9: 2017,
        10: 45.6,
      }),
    ]);

    const result = parseExcelSheets([sheet], 2016);

    expect(result.transactions[0].amount).toBe(45.6);
    expect(result.transactions[0].type).toBe("expense");
  });

  test("extracts the income and expense options from the Global page", () => {
    const result = parseExcelSheets([globalPage()], 2016);

    expect(result.categories).toHaveLength(21);
    expect(result.categories[0]).toEqual({
      label: "Nóminas",
      type: "income",
    });
    expect(
      result.categories.filter((c) => c.type === "income").map((c) => c.label),
    ).toEqual([
      "Nóminas",
      "Ingresos por intereses",
      "Dividendos",
      "Ganancias patrimoniales",
      "Becas y subvenciones",
      "Ingresos extraordinarios",
      "Apuestas y juego",
      "Bonificaciones",
    ]);
    const expenses = result.categories.filter((c) => c.type === "expense");
    expect(expenses).toHaveLength(13);
    expect(expenses[0].label).toBe("Hipoteca / Alquiler / Seguros");
    expect(expenses[12].label).toBe("Otros gastos");
  });

  test("reports sheets without a header as errors", () => {
    const result = parseExcelSheets(
      [{ sheet: "Ene.", data: [row({ 0: "foo" }), row({ 0: "bar" })] }],
      2016,
    );

    expect(result.transactions).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/cabecera/i);
  });

  test("skips non-monthly pages without a header", () => {
    const result = parseExcelSheets([globalPage()], 2016);

    expect(result.errors).toEqual([]);
    expect(result.transactions).toHaveLength(0);
  });
});
