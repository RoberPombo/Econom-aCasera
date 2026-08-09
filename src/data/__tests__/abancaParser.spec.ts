import { describe, expect, test } from "vitest";
import { parseAbancaCsv } from "../parsers/abancaParser";

const header = "Fecha;Concepto;Saldo;Importe;Fecha operación;Fecha valor";

describe("parseAbancaCsv", () => {
  test("parses an Abanca export with income and expense rows", () => {
    const csv = [
      header,
      "06-08-2026;ALDI OLEIROS     \\LA CORUNA\\ES2608061240;1325.66 EUR;-53.79 EUR;2026-08-06T00:00:00;2026-08-06T00:00:00",
      "04-08-2026;SAINZA GAYOSO PUENTE;1601.48 EUR;371.01 EUR;2026-08-04T00:00:00;2026-08-04T00:00:00",
    ].join("\n");

    const result = parseAbancaCsv(csv);

    expect(result.errors).toEqual([]);
    expect(result.transactions).toHaveLength(2);

    const [expense, income] = result.transactions;
    expect(expense.date).toBe("2026-08-06");
    expect(expense.type).toBe("expense");
    expect(expense.concept).toBe("ALDI OLEIROS     \\LA CORUNA\\ES2608061240");
    expect(expense.amount).toBe(53.79);

    expect(income.date).toBe("2026-08-04");
    expect(income.type).toBe("income");
    expect(income.amount).toBe(371.01);
  });

  test("maps concepts to categories and incomes to Nómina", () => {
    const csv = [
      header,
      "06-08-2026;LIDL OLEIROS\\ES2607301043;2301.65 EUR;-45.01 EUR;2026-07-30T00:00:00;2026-07-30T00:00:00",
      "05-08-2026;COMPRA EN VENTA BILLETES RENFE;1536.83 EUR;-22.3 EUR;2026-08-05T00:00:00;2026-08-05T00:00:00",
      "04-08-2026;ESTANCO GUISAMO;1559.13 EUR;-42.35 EUR;2026-08-04T00:00:00;2026-08-04T00:00:00",
      "01-08-2026;Vodafone Servicios, S.L.U.;1140.56 EUR;-57.0 EUR;2026-07-14T00:00:00;2026-07-14T00:00:00",
      "04-08-2026;ASPRONAGA,;2346.66 EUR;1483.31 EUR;2026-07-29T00:00:00;2026-07-29T00:00:00",
    ].join("\n");

    const result = parseAbancaCsv(csv);

    expect(result.transactions.map((t) => t.category)).toEqual([
      "Comida",
      "Transporte",
      "Ocio",
      "Hogar",
      "Nómina",
    ]);
  });

  test("ignores the trailing legal text after an empty row", () => {
    const csv = [
      header,
      "06-08-2026;ALDI OLEIROS;1325.66 EUR;-53.79 EUR;2026-08-06T00:00:00;2026-08-06T00:00:00",
      "",
      "Le informamos de que este depósito está garantizado y por tanto no está excluido de la garantía del Fondo de Garantía de Depósitos.",
    ].join("\n");

    const result = parseAbancaCsv(csv);

    expect(result.transactions).toHaveLength(1);
    expect(result.errors).toEqual([]);
  });

  test("returns an error when the header row is missing", () => {
    const result = parseAbancaCsv(
      "foo;bar\nALDI OLEIROS;1325.66 EUR;-53.79 EUR;2026-08-06",
    );

    expect(result.transactions).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/cabecera/i);
  });

  test("skips rows whose amount is zero", () => {
    const csv = [
      header,
      "06-08-2026;ALDI OLEIROS;1325.66 EUR;0 EUR;2026-08-06T00:00:00;2026-08-06T00:00:00",
    ].join("\n");

    const result = parseAbancaCsv(csv);

    expect(result.transactions).toHaveLength(0);
  });

  test("reports rows with an invalid date as errors", () => {
    const csv = [
      header,
      "99-99-2026;ALDI OLEIROS;1325.66 EUR;-53.79 EUR;2026-08-06T00:00:00;2026-08-06T00:00:00",
      "06-08-2026;MERCADONA;1325.66 EUR;-30.98 EUR;2026-08-06T00:00:00;2026-08-06T00:00:00",
    ].join("\n");

    const result = parseAbancaCsv(csv);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/Fila 2/i);
    expect(result.transactions).toHaveLength(1);
  });
});
