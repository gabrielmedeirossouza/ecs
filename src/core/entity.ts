import { Component } from "./component"
import { Class } from "./utils"

export class Entity {
    private static nextId = 1
    public readonly id = Entity.nextId++

    constructor(
        public readonly name: string
    ) {}

    private components: Map<string, Component> = new Map()

    add(component: Component): void {
        this.components.set(component.constructor.name, component)
    }

    get<T extends Class<Component>>(componentClass: T): InstanceType<T> {
        const component = this.components.get(componentClass.name)
        if (!component) {
            throw new Error(`Component ${componentClass.name} not found.`)
        }
        return component as InstanceType<T>
    }

    getAll(): Component[] {
        return Array.from(this.components.values())
    }

    attemptGet<T extends Class<Component>>(componentClass: T): InstanceType<T> | undefined {
        return this.components.get(componentClass.name) as InstanceType<T> | undefined
    }

    has(componentClass: Class<Component>): boolean {
        return this.components.has(componentClass.name)
    }

    remove(componentClass: Class<Component>): void {
        if (!this.components.delete(componentClass.name)) {
            throw new Error(`Component ${componentClass.name} not found.`)
        }
    }
}
