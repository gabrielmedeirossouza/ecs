import type { Class } from "./utils"
import type { Component } from "./component"
import type { Entity } from "./entity"

export class EntityView {
    constructor(
        private readonly entity: Entity,
        private readonly R: Set<Class<Component>>,
        private readonly systemName: string,
    ) { }

    get id() { return this.entity.id }

    get name() { return this.entity.name }

    __unsafeEntity(): Entity {
        return this.entity
    }

    get<T extends Class<Component>>(cls: T): InstanceType<T> {
        if (!this.R.has(cls)) {
            throw new Error(
                `[QueryDenied] System "${this.systemName}" tentou ler "${cls.name}" sem declará-lo em @Read.`
            )
        }
        return this.entity.get(cls)
    }

    attemptGet<T extends Class<Component>>(cls: T): InstanceType<T> | undefined {
        if (!this.R.has(cls)) {
            throw new Error(
                `[QueryDenied] System "${this.systemName}" tentou ler "${cls.name}" sem declará-lo em @Read.`
            )
        }
        return this.entity.attemptGet(cls)
    }

    has(cls: Class<Component>): boolean {
        if (!this.R.has(cls)) {
            throw new Error(
                `[QueryDenied] System "${this.systemName}" tentou verificar "${cls.name}" sem declará-lo em @Read.`
            )
        }
        return this.entity.has(cls)
    }
}
