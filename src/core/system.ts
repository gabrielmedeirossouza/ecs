import { CommandBuffer } from "./command-buffer"
import { Component } from "./component"
import { ExtendsToken, isExtendsToken } from "./extends-token"
import { ServiceManager } from "./service-manager"
import { Class } from "./utils"
import { EntityView, World, WorldView } from "./world"

export type ReadKey = Class<Component> | ExtendsToken

export function System(constructor: { new(...args: any[]): any }) {
    World.addSystem(constructor)
}

type Where<T> = { all?: T[]; any?: T[]; none?: T[] }

function normalizeWhere(
    filters: (ReadKey[] | [Where<ReadKey>])
): Where<ReadKey> {
    const single = filters.length === 1 && typeof filters[0] === "object" && !isExtendsToken(filters[0])
    return single
        ? (filters[0] as Where<ReadKey>)
        : { all: (filters as ReadKey[]) }
}

function collectReadKeys(where: Where<ReadKey>): ReadKey[] {
    const out: ReadKey[] = []
    const pushAll = (arr?: ReadKey[]) => { if (arr) out.push(...arr) }
    pushAll(where.all)
    pushAll(where.any)
    pushAll(where.none)
    return out
}

export function Query(
    ...filters: ReadKey[] | [Where<ReadKey>]
) {
    return function (target: any, propertyKey: string, _desc: PropertyDescriptor) {
        const where = normalizeWhere(filters as any)
        if (!target.__queryDef) target.__queryDef = new Map<string, Where<ReadKey>>()
        target.__queryDef.set(propertyKey, where)

        const requiredReads = collectReadKeys(where)
        const current = new Set<ReadKey>(target.__read ?? [])
        for (const rk of requiredReads) current.add(rk)
        target.__read = Array.from(current)
    }
}

export function Read(...items: (Class<Component> | ExtendsToken)[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const prev = target.__read ?? []
        const set = new Set<any>(prev)
        for (const it of items) set.add(it)
        target.__read = Array.from(set)
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

export function IdempotentWrite(): ClassDecorator {
    return (ctor) => { (ctor as any).__idempotentWrite = true }
}

export function isIdempotentWrite(C: Function): boolean {
    return Boolean((C as any).__idempotentWrite)
}


export interface System {
    __name?: string
    __read?: Array<Class<Component> | ExtendsToken>
    __write?: Array<Class<Component>>
    __queryDef?: Map<string, any>
    execute(entity: EntityView, ctx: SystemContext): void | Promise<void>
}

export interface Execution {
    readonly hasMultipleMatches: boolean
    readonly isLastMatch: boolean
    readonly currentMatch: number
    readonly totalMatches: number
    readonly matches: string[]
}

export type SystemContext = {
    buffer: CommandBuffer
    world: WorldView
    services: ServiceManager
    execution: Execution
}
