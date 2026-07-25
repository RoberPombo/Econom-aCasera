import { Entity } from "./Entity";

export interface PersonData {
  id?: string | number;
  name: string;
  active?: boolean;
}

export class Person extends Entity {
  readonly name: string;
  readonly active: boolean;

  private constructor(data: Required<PersonData>) {
    super(data.id);
    this.name = data.name;
    this.active = data.active;
  }

  static create(data: PersonData): Person {
    if (!data.name.trim()) {
      throw new Error("El nombre no puede estar vacío");
    }
    return new Person({
      id: data.id ?? crypto.randomUUID(),
      name: data.name.trim(),
      active: data.active ?? true,
    });
  }

  toggleActive(): Person {
    return new Person({
      id: this.id,
      name: this.name,
      active: !this.active,
    });
  }
}
