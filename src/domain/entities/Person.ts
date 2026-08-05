import { Entity } from "./Entity";
import { normalizeKey, isValidKey } from "./Key";

export interface PersonData {
  id?: string | number;
  label: string;
  key?: string;
  active?: boolean;
}

export class Person extends Entity {
  readonly label: string;
  readonly key: string;
  readonly active: boolean;

  private constructor(data: Required<PersonData>) {
    super(data.id);
    this.label = data.label;
    this.key = data.key;
    this.active = data.active;
  }

  static create(data: PersonData): Person {
    const label = data.label.trim();
    const key = data.key?.trim() || normalizeKey(label);
    if (!label) {
      throw new Error("El nombre no puede estar vacío");
    }
    if (!isValidKey(key)) {
      throw new Error("La clave no es válida");
    }
    return new Person({
      id: data.id ?? crypto.randomUUID(),
      label,
      key,
      active: data.active ?? true,
    });
  }

  withLabel(label: string): Person {
    return new Person({
      id: this.id,
      label: label.trim(),
      key: this.key,
      active: this.active,
    });
  }

  toggleActive(): Person {
    return new Person({
      id: this.id,
      label: this.label,
      key: this.key,
      active: !this.active,
    });
  }
}
