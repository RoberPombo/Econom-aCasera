export abstract class Entity {
  constructor(public readonly id: string | number) {}

  equals(other: Entity): boolean {
    return this.id === other.id;
  }
}
