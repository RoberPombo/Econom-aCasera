export abstract class Entity {
  public readonly id: string | number;

  constructor(id: string | number) {
    this.id = id;
  }

  equals(other: Entity): boolean {
    return this.id === other.id;
  }
}
