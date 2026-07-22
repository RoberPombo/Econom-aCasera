export class InvalidAmountError extends Error {}

export class Amount {
  private constructor(public readonly value: number) {}

  static create(value: number): Amount {
    if (isNaN(value)) {
      throw new InvalidAmountError("El importe debe ser un número");
    }
    if (value <= 0) {
      throw new InvalidAmountError("El importe debe ser mayor que cero");
    }
    return new Amount(Math.round(value * 100) / 100);
  }
}
