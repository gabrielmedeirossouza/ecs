import { CommandBuffer } from "./command-buffer"
import { Component } from "./component"
import { ServiceManager } from "./service-manager"
import { Class } from "./utils"
import { World } from "./world"
import { WorldView } from "./world-view"

export function System(constructor: { new(...args: any[]): any }) {
    const instance = new constructor()

    Reflect.set(instance, "__name", constructor.name)

    World.addSystem(instance)
}

export function Read(...components: Class<Component>[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target.__read) {
            target.__read = components
        } else {
            target.__read.push(...components)
        }
    }
}

export function Write(...components: Class<Component>[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target.__write) {
            target.__write = components
        } else {
            target.__write.push(...components)
        }
    }
}

export interface System {
    __name?: string
    __read?: Array<Class<Component>>
    __write?: Array<Class<Component>>
    execute(ctx: SystemContext): void | Promise<void>
}

export type SystemContext = {
    view: WorldView
    buffer: CommandBuffer
    world: World
    services: ServiceManager
}