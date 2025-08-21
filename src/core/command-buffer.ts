import { Component } from "./component"
import { Class } from "./utils"
import { Entity, EntityView, World } from "./world"

export class CommandBuffer {
    constructor(
        private world: World,
        private writeSet: Set<Class<Component>>,
        private systemName: string
    ) { }

    _ops: Array<
        | { op: "add"; entity: Entity; component: Component }
        | { op: "remove"; entity: Entity; componentClass: Class<Component> }
    > = []

    add(entityLike: Entity | EntityView, component: Component) {
        const C = component.constructor as Class<Component>
        if (!this.writeSet.has(C)) {
            throw new Error(`[WriteDenied] System "${this.systemName}" tentou escrever "${C.name}" sem @Write.`)
        }
        const entity = (entityLike instanceof EntityView) ? entityLike.__unsafeEntity() : entityLike
        this._ops.push({ op: "add", entity, component })
    }

    remove(entityLike: Entity | EntityView, cls: Class<Component>) {
        if (!this.writeSet.has(cls)) {
            throw new Error(`[WriteDenied] System "${this.systemName}" tentou remover "${cls.name}" sem @Write.`)
        }
        const entity = (entityLike instanceof EntityView) ? entityLike.__unsafeEntity() : entityLike
        this._ops.push({ op: "remove", entity, componentClass: cls })
    }
}
