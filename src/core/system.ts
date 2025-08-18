import { CommandBuffer } from "./command-buffer"
import { Component } from "./component"
import { ExtendsToken } from "./extends-token"
import { ServiceManager } from "./service-manager"
import { Class } from "./utils"
import { EntityView, World, WorldView } from "./world"

export type ReadKey = Class<Component> | ExtendsToken

export function System(constructor: { new(...args: any[]): any }) {
    World.addSystem(constructor)
}

export type Where<T> = { all?: T[]; any?: T[]; none?: T[] }

function normalizeWhere(filters: QueryKey[] | [Where<QueryKey>]): Where<QueryKey> {
    if (filters.length === 1 && isWhereQueryKey(filters[0])) {
        return filters[0] as Where<QueryKey>
    }
    return { all: filters as QueryKey[] }
}

function mergeWhere(a: Where<QueryKey> | undefined, b: Where<QueryKey>): Where<QueryKey> {
    if (!a) return { all: b.all ?? [], any: b.any ?? [], none: b.none ?? [] }
    return {
        all: [...(a.all ?? []), ...(b.all ?? [])],
        any: [...(a.any ?? []), ...(b.any ?? [])],
        none: [...(a.none ?? []), ...(b.none ?? [])],
    }
}

export type RefToken<R extends Component & { id: number } = any> = {
    __kind: "ref"
    ref: Class<R>
    where: Where<ReadKey>
}

export type QueryKey = ReadKey | RefToken<any>

export const isRefToken = (x: unknown): x is RefToken<any> =>
    !!x && typeof x === "object" && (x as any).__kind === "ref"

export function QueryRef<R extends Component & { id: number }>(
    Ref: Class<R>,
    ...keys: ReadKey[]
): RefToken<R>
export function QueryRef<R extends Component & { id: number }>(
    Ref: Class<R>,
    where: Where<ReadKey>
): RefToken<R>
export function QueryRef<R extends Component & { id: number }>(
    Ref: Class<R>,
    ...rest: any[]
): RefToken<R> {
    const arg = rest[0]
    const isWhere = !!arg && typeof arg === "object" && ("all" in arg || "any" in arg || "none" in arg)
    const where: Where<ReadKey> = isWhere ? arg : { all: rest as ReadKey[] }
    return { __kind: "ref", ref: Ref, where }
}

function isWhereQueryKey(obj: any): obj is Where<QueryKey> {
    return !!obj && typeof obj === "object" && (
        ("all" in obj && Array.isArray(obj.all)) ||
        ("any" in obj && Array.isArray(obj.any)) ||
        ("none" in obj && Array.isArray(obj.none))
    )
}

function collectReadKeys(where: Where<QueryKey>): ReadKey[] {
    const out = new Set<ReadKey>()
    const pull = (arr?: QueryKey[]) => {
        for (const k of (arr ?? [])) {
            if (isRefToken(k)) {
                out.add(k.ref)
                if (k.where?.all) k.where.all.forEach(v => out.add(v))
                if (k.where?.any) k.where.any.forEach(v => out.add(v))
            } else {
                out.add(k as ReadKey)
            }
        }
    }
    pull(where.all); pull(where.any)
    return [...out]
}

export function Query(
  ...filters: QueryKey[] | [Where<QueryKey>]
) {
  return function (target: any, propertyKey: string, _desc: PropertyDescriptor) {
    const next = normalizeWhere(filters as any)

    const def: Map<string, Where<QueryKey>> = target.__queryDef ??= new Map()
    const prev = def.get(propertyKey)
    const merged = mergeWhere(prev, next)
    def.set(propertyKey, merged)

    const current = new Set<ReadKey>(target.__read ?? [])
    for (const rk of collectReadKeys(merged)) current.add(rk)
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
