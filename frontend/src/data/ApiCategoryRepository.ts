import type { Category } from "../domain/entities";
import type { CategoryRepository } from "../domain/repositories/CategoryRepository";

export class ApiCategoryRepository implements CategoryRepository {
  private async api<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.json();
  }

  async getAll(): Promise<Category[]> {
    return this.api<Category[]>("/category-config");
  }

  async create(name: string, type: "income" | "expense"): Promise<Category> {
    return this.api<Category>("/category-config", {
      method: "POST",
      body: JSON.stringify({ name, type }),
    });
  }

  async update(category: Category): Promise<void> {
    await this.api<{ ok: boolean }>(`/category-config/${category.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: category.name,
        type: category.type,
        active: category.active ? 1 : 0,
      }),
    });
  }

  async delete(id: number): Promise<void> {
    await this.api<{ ok: boolean }>(`/category-config/${id}`, { method: "DELETE" });
  }
}
