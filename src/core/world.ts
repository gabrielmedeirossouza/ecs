import { CommandBuffer } from "./command-buffer"
import { Component } from "./component"
import { ExtendsToken, isExtendsToken, isSubOrSame } from "./extends-token"
import { Service, ServiceManager } from "./service-manager"
import { isIdempotentWrite, ReadKey, System, SystemContext } from "./system"
import { Class } from "./utils"

export class Entity {
    private static nextId = 1;
    public readonly id = Entity.nextId++;
    constructor(public readonly name: string) { }
    private components = new Map<string, Component>();

    add(component: Component): void {
        this.components.set(component.constructor.name, component)
    }

    get<T extends Class<Component>>(Ctor: T): InstanceType<T> {
        const c = this.components.get(Ctor.name)
        if (!c) throw new Error(`Component ${Ctor.name} not found.`)
        return c as InstanceType<T>
    }

    attemptGet<T extends Class<Component>>(Ctor: T): InstanceType<T> | undefined {
        return this.components.get(Ctor.name) as any
    }

    has(Ctor: Class<Component>): boolean {
        return this.components.has(Ctor.name)
    }

    getComponents<T extends Component>(ClsOrExt: Class<T> | ExtendsToken<T>): ReadonlyArray<T> {
        const isExt = isExtendsToken(ClsOrExt)
        if (isExt) {
            const Base = (ClsOrExt as ExtendsToken<T>).base
            return this.getAllExtends(Base as any) as T[]
        } else {
            const Ctor = ClsOrExt as Class<T>
            const one = this.attemptGet(Ctor)
            return one ? [one as T] : []
        }
    }

    getAll(): Component[] {
        return Array.from(this.components.values())
     }

    getAllExtends<T extends Component>(Base: Class<T>): InstanceType<Class<T>>[] {
        const out: any[] = []
        for (const c of this.getAll()) if (c instanceof Base) out.push(c)
        return out
    }

    remove(Ctor: Class<Component>): void {
        if (!this.components.delete(Ctor.name)) {
            throw new Error(`Component ${Ctor.name} not found.`)
        }
    }
}

function hasReadPermission(readSet: Set<ReadKey>, key: ReadKey): boolean {
    if (typeof key === "function") {
        if (readSet.has(key)) return true
        for (const rk of readSet) {
            if (isExtendsToken(rk)) {
                if (isSubOrSame(key as any, rk.base as any)) return true
            }
        }
        return false
    }

    if (isExtendsToken(key)) {
        for (const rk of readSet) {
            if (isExtendsToken(rk) && rk.base === key.base) return true
        }

        for (const rk of readSet) {
            if (typeof rk === "function" && (rk === key.base || isSubOrSame(rk as any, key.base as any))) {
                return true
            }
        }
        return false
    }

    return false
}

export class EntityView {
    constructor(
        private readonly entity: Entity,
        private readonly readSet: Set<ReadKey>,
        private readonly systemName: string
    ) { }

    get id() { return this.entity.id }
    get name() { return this.entity.name }

    get<T extends Class<Component>>(cls: T): InstanceType<T> {
        if (!this.readSet.has(cls)) {
            throw new Error(`[QueryDenied] System "${this.systemName}" tentou ler "${cls.name}" sem @Read.`)
        }
        return this.entity.get(cls)
    }


    getComponents<T extends Component>(ClsOrExt: Class<T> | ExtendsToken<T>): ReadonlyArray<T> {
        if (!hasReadPermission(this.readSet, ClsOrExt as ReadKey)) {
            const label = isExtendsToken(ClsOrExt)
                ? `Extends<${ClsOrExt.base.name}>`
                : (ClsOrExt as Class<Component>).name
            throw new Error(`[QueryDenied] System "${this.systemName}" tentou ler "${label}" sem @Read/@Query.`)
        }
        return this.entity.getComponents(ClsOrExt as any) as ReadonlyArray<T>
    }

    attemptGet<T extends Class<Component>>(cls: T): InstanceType<T> | undefined {
        if (!this.readSet.has(cls)) {
            throw new Error(`[QueryDenied] System "${this.systemName}" tentou ler "${cls.name}" sem @Read.`)
        }
        return this.entity.attemptGet(cls)
    }

    has(cls: Class<Component>): boolean {
        if (!this.readSet.has(cls)) {
            throw new Error(`[QueryDenied] System "${this.systemName}" tentou verificar "${cls.name}" sem @Read.`)
        }
        return this.entity.has(cls)
    }

    __unsafeEntity(): Entity { return this.entity }
}

type Where<T> = { all?: T[]; any?: T[]; none?: T[] }

export class World {
    private serviceManager = new ServiceManager();
    private _entities = new Map<number, Entity>();

    createEntity(name: string): Entity {
        const e = new Entity(name)
        this._entities.set(e.id, e)
        return e
    }
    getEntity(id: number): Entity {
        const e = this._entities.get(id)
        if (!e) throw new Error(`Entity ${id} not found`)
        return e
    }
    provide(...services: Service[]) { this.serviceManager.provide(...services) }

    getComponents<T extends Component>(ClsOrExt: Class<T> | ExtendsToken<T>): ReadonlyArray<T> {
        const out: T[] = []
        const isExt = isExtendsToken(ClsOrExt)
        const Base = isExt ? (ClsOrExt as ExtendsToken<T>).base : (ClsOrExt as Class<T>)
        for (const e of this._entities.values()) {
            if (isExt) out.push(...(e.getAllExtends(Base as any) as T[]))
            else {
                const c = e.attemptGet(Base as any)
                if (c) out.push(c as T)
            }
        }
        return out
    }

    _match(where: Where<ReadKey>): Entity[] {
        const all = where.all ?? []
        const any = where.any ?? []
        const none = where.none ?? []

        const satisfies = (e: Entity, f: ReadKey) => {
            if ((f as any).__kind === "extends") {
                const base = (f as ExtendsToken).base
                return e.getAllExtends(base as any).length > 0
            }
            return e.has(f as Class<Component>)
        }

        const out: Entity[] = []
        for (const e of this._entities.values()) {
            if (all.length && !all.every((f) => satisfies(e, f))) continue
            if (any.length && !any.some((f) => satisfies(e, f))) continue
            if (none.length && none.some((f) => satisfies(e, f))) continue
            out.push(e)
        }
        return out
    }

    private static registry: System[] = [];
    private static cachedBatches: System[][] | null = null;

    static addSystem(...systems: System[]) {
        this.registry.push(...systems)
        this.cachedBatches = null
    }

    private static resolveBatches(): System[][] {
        if (this.cachedBatches) return this.cachedBatches

        const systems = [...this.registry]
        const nameToSys = new Map(systems.map(s => [s.__name!, s]))
        const R = (s: System) => new Set(s.__read ?? [] as Array<Class<Component>>)
        const W = (s: System) => new Set(s.__write ?? [] as Array<Class<Component>>)

        const edges = new Map<string, Set<string>>()
        const indeg = new Map<string, number>()
        for (const s of systems) {
            edges.set(s.__name!, new Set())
            indeg.set(s.__name!, 0)
        }
        const addEdge = (from: string, to: string) => {
            if (from === to) return
            const set = edges.get(from)!
            if (!set.has(to)) {
                set.add(to)
                indeg.set(to, (indeg.get(to)! + 1))
            }
        }

        for (let i = 0; i < systems.length; i++) {
            for (let j = 0; j < systems.length; j++) {
                if (i === j) continue
                const A = systems[i], B = systems[j]
                const wA = W(A), rB = R(B), wB = W(B)

                const writeRead = [...wA].some(Cw =>
                    [...rB].some(Rk => {
                        if (isExtendsToken(Rk)) {
                            return isSubOrSame(Cw as any, Rk.base as any)
                        }
                        return isSubOrSame(Cw as any, Rk as any)
                    })
                )

                if (writeRead) {
                    addEdge(A.__name!, B.__name!)
                    continue
                }

                const wwOverlap = [...wA].some(C => wB.has(C) && !isIdempotentWrite(C as any))
                if (wwOverlap) {
                    const a = A.__name!, b = B.__name!
                    const [from, to] = a < b ? [a, b] : [b, a]
                    addEdge(from, to)
                }
            }
        }

        const batches: System[][] = []
        const zeroQ = systems
            .filter(s => (indeg.get(s.__name!) ?? 0) === 0)
            .map(s => s.__name!)
            .sort()

        const removed = new Set<string>()
        while (zeroQ.length) {
            const lvl = [...zeroQ]
            zeroQ.length = 0

            batches.push(lvl.map(n => nameToSys.get(n)!))

            for (const n of lvl) {
                removed.add(n)
                for (const to of edges.get(n)!) {
                    indeg.set(to, (indeg.get(to)! - 1))
                    if (indeg.get(to) === 0) zeroQ.push(to)
                }
            }
            zeroQ.sort()
        }

        if (removed.size !== systems.length) {
            throw new Error(describeCycle(systems, edges, R, W))
        }

        this.cachedBatches = batches
        return batches

        function describeCycle(
            systems: System[],
            edges: Map<string, Set<string>>,
            Rf: (s: System) => Set<ReadKey>,
            Wf: (s: System) => Set<Class<Component>>,
        ): string {
            const nodes = systems.map(s => s.__name!)
            const cycle = findSmallCycle(nodes, edges)

            let details = `Ciclo/empate RW detectado; a ordem é impossível.\n`
            if (cycle.length) {
                details += `Exemplo: ${cycle.join(" -> ")} -> ${cycle[0]}\n`

                const map = new Map(systems.map(s => [s.__name!, s]))
                const reasons: string[] = []

                for (let i = 0; i < cycle.length; i++) {
                    const a = map.get(cycle[i])!, b = map.get(cycle[(i + 1) % cycle.length])!
                    const Wa = Wf(a), Wb = Wf(b), Rb = Rf(b)

                    const rr = rwMatches(Wa, Rb) // W(a) → R(b)
                    const ww = wwMatches(Wa, Wb) // W(a) → W(b) (não-idempotentes)

                    const parts: string[] = []
                    if (rr.length) parts.push(`W(${a.__name!})→R(${b.__name!}) em {${rr.join(", ")}}`)
                    if (ww.length) parts.push(`W(${a.__name!})→W(${b.__name!}) em {${ww.join(", ")}}`)

                    reasons.push(`- ${a.__name!} → ${b.__name!}: ${parts.join(" e ") || "motivo não identificado"}`)
                }
                details += reasons.join("\n")
            }
            return details

            function rwMatches(
                w: Set<Class<Component>>,
                r: Set<ReadKey>
            ): string[] {
                const out = new Set<string>()
                for (const Wc of w) {
                    for (const Rk of r) {
                        if (isExtendsToken(Rk)) {
                            if (isSubOrSame(Wc as any, Rk.base as any)) {
                                out.add(`${(Wc as any).name}→Extends<${Rk.base.name}>`)
                            }
                        } else {
                            if (isSubOrSame(Wc as any, Rk as any)) {
                                out.add(`${(Wc as any).name}→${(Rk as any).name}`)
                            }
                        }
                    }
                }
                return [...out]
            }

            function wwMatches(
                w1: Set<Class<Component>>,
                w2: Set<Class<Component>>
            ): string[] {
                const out: string[] = []
                for (const c of w1) {
                    if (w2.has(c) && !(isIdempotentWrite as any)?.(c)) {
                        out.push((c as any).name)
                    }
                }
                return out
            }
        }


        function findSmallCycle(nodes: string[], edges: Map<string, Set<string>>): string[] {
            const setNodes = new Set(nodes)
            const visiting = new Set<string>(), visited = new Set<string>(), stack: string[] = []
            const dfs = (u: string): string[] | null => {
                visiting.add(u); stack.push(u)
                for (const v of edges.get(u) ?? []) {
                    if (!setNodes.has(v)) continue
                    if (visiting.has(v)) { const idx = stack.indexOf(v); return stack.slice(idx) }
                    if (!visited.has(v)) { const found = dfs(v); if (found) return found }
                }
                visiting.delete(u); visited.add(u); stack.pop(); return null
            }
            for (const n of nodes) { if (!visited.has(n)) { const c = dfs(n); if (c) return c } }
            return []
        }
    }

    async execute() {
        const batches = World.resolveBatches()
        for (const level of batches) {
            const buffers = await Promise.all(
                level.map(async (system) => {
                    const readSet = new Set(system.__read ?? [])
                    const buffer = new CommandBuffer(this, new Set(system.__write ?? []), system.__name!)

                    // Localiza o método de entrada (por padrão “execute”)
                    // e obtém a where-clause do @Query
                    const methodName = "execute"
                    const where = system.__queryDef?.get(methodName) as Where<ReadKey> | undefined
                    if (!where) {
                        // Sem @Query no método — nada de view; apenas chame uma vez sem entity?
                        // Para manter contratos rígidos, exigimos @Query:
                        throw new Error(`[QueryMissing] System "${system.__name}" precisa declarar @Query no método "${methodName}".`)
                    }

                    // Itera entidades e invoca execute(entity, ctx)
                    const matched = this._match(where)
                    for (const ent of matched) {
                        const entityRef = new EntityView(ent, readSet, system.__name!)
                        await (system as any)[methodName](entityRef, {
                            buffer,
                            world: this,
                            services: this.serviceManager,
                        } as SystemContext)
                    }
                    return buffer
                })
            )
            for (const buf of buffers) this.applyBuffer(buf)
        }
    }

    private applyBuffer(buf: CommandBuffer) {
        for (const op of buf._ops) {
            if (op.op === "add") {
                op.entity.add(op.component)
            } else {
                op.entity.remove(op.componentClass)
            }
        }
    }

    static showOrder(): string {
        const batches = this.resolveBatches()
        return batches.map((lvl, i) => `#${i}: ${lvl.map(s => s.__name!).join(", ")}`).join("\n")
    }
}
