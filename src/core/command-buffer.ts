import type { Component } from "./component";
import type { Entity } from "./entity";
import type { Class } from "./utils";
import { World } from "./world";
import { EntityView } from "./entity-view";

function asEntity(e: Entity | EntityView): Entity {
  return (e instanceof EntityView) ? (e as any).__unsafeEntity() : e;
}

export class CommandBuffer {
  constructor(
    private world: World,
    private W: Set<Class<Component>>,
    private systemName: string
  ) {}

  _ops: Array<
    | { op: "add"; entity: Entity; component: Component }
    | { op: "remove"; entity: Entity; componentClass: Class<Component> }
  > = [];

  add(entityLike: Entity | EntityView, component: Component) {
    const C = component.constructor as Class<Component>;
    if (!this.W.has(C)) {
      throw new Error(
        `[WriteDenied] System "${this.systemName}" tentou escrever "${C.name}" sem @Write.`
      );
    }
    const entity = asEntity(entityLike);
    this._ops.push({ op: "add", entity, component });
  }

  remove(entityLike: Entity | EntityView, cls: Class<Component>) {
    if (!this.W.has(cls)) {
      throw new Error(
        `[WriteDenied] System "${this.systemName}" tentou remover "${cls.name}" sem @Write.`
      );
    }
    const entity = asEntity(entityLike);
    this._ops.push({ op: "remove", entity, componentClass: cls });
  }
}
