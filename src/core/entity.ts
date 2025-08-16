import { Component } from "./component"
import { Class } from "./utils"

export class Entity {
    private static nextId = 1
    public readonly id = Entity.nextId++

    constructor(
        public readonly name: string
    ) { }

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

    getAllExtends<T extends Component>(Base: Class<T>): InstanceType<Class<T>>[] {
        const items: any[] = []
        for (const c of this.getAll()) {
            if (c instanceof Base) items.push(c)
        }
        return items
    }

    attemptGet<T extends Class<Component>>(componentClass: T): InstanceType<T> | undefined {
        return this.components.get(componentClass.name) as InstanceType<T> | undefined
    }

    has(componentClass: Class<Component>): boolean {
        return this.components.has(componentClass.name)
    }

    hasExtends<T extends Component>(Base: Class<T>): boolean {
        for (const c of this.getAll()) if (c instanceof Base) return true
        return false
    }

    remove(componentClass: Class<Component>): void {
        if (!this.components.delete(componentClass.name)) {
            throw new Error(`Component ${componentClass.name} not found.`)
        }
    }
}
