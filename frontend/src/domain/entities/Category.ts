import { Entity } from "./Entity";

export type CategoryType = "income" | "expense";

export interface CategoryData {
  id?: number;
  name: string;
  type: CategoryType;
  active?: boolean;
}

export class Category extends Entity {
  readonly name: string;
  readonly type: CategoryType;
  readonly active: boolean;

  private constructor(data: Required<CategoryData>) {
    super(data.id);
    this.name = data.name;
    this.type = data.type;
    this.active = data.active;
  }

  static create(data: CategoryData): Category {
    if (!data.name.trim()) {
      throw new Error("El nombre de la categoría no puede estar vacío");
    }
    return new Category({
      id: data.id ?? crypto.randomUUID(),
      name: data.name.trim(),
      type: data.type,
      active: data.active ?? true,
    });
  }

  toggleActive(): Category {
    return new Category({
      id: this.id,
      name: this.name,
      type: this.type,
      active: !this.active,
    });
  }
}
