import { Entity } from "./Entity";
import { isValidKey, normalizeKey } from "./Key";

export type CategoryType = "income" | "expense";

export interface CategoryData {
  id?: string | number;
  label: string;
  key?: string;
  type: CategoryType;
  active?: boolean;
}

export class Category extends Entity {
  readonly label: string;
  readonly key: string;
  readonly type: CategoryType;
  readonly active: boolean;

  private constructor(data: Required<CategoryData>) {
    super(data.id);
    this.label = data.label;
    this.key = data.key;
    this.type = data.type;
    this.active = data.active;
  }

  static create(data: CategoryData): Category {
    const label = data.label.trim();
    const key = data.key?.trim() || normalizeKey(label);
    if (!label) {
      throw new Error("El nombre de la categoría no puede estar vacío");
    }
    if (!isValidKey(key)) {
      throw new Error("La clave de la categoría no es válida");
    }
    return new Category({
      id: data.id ?? crypto.randomUUID(),
      label,
      key,
      type: data.type,
      active: data.active ?? true,
    });
  }

  withLabel(label: string): Category {
    return new Category({
      id: this.id,
      label: label.trim(),
      key: this.key,
      type: this.type,
      active: this.active,
    });
  }

  toggleActive(): Category {
    return new Category({
      id: this.id,
      label: this.label,
      key: this.key,
      type: this.type,
      active: !this.active,
    });
  }
}
