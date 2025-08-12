import type { Component } from "./component"
import type { Class } from "./utils"
import type { System } from "./system"
import { Entity } from "./entity"
import { CommandBuffer } from "./command-buffer"
import { WorldView } from "./world-view"
import { Service, ServiceManager } from "./service-manager"

type QueryWhere = {
  all?: Array<Class<Component>>
  any?: Array<Class<Component>>
  none?: Array<Class<Component>>
}

export class World {
  private serviceManager = new ServiceManager()
  private _entities = new Map<number, Entity>()

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

  provide(...services: Service[]) {
    this.serviceManager.provide(...services)
  }

  _queryUnsafe(...components: Array<Class<Component>>): Entity[] {
    return this._queryUnsafeWhere({ all: components })
  }

  _queryUnsafeWhere(where: QueryWhere): Entity[] {
    const all = where.all ?? []
    const any = where.any ?? []
    const none = where.none ?? []

    const out: Entity[] = []
    for (const e of this._entities.values()) {
      if (all.length && !all.every(C => e.has(C))) continue
      if (any.length && !any.some(C => e.has(C))) continue
      if (none.length && none.some(C => e.has(C))) continue
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

        const writeRead = [...wA].some(C => rB.has(C))
        const writeWrite = [...wA].some(C => wB.has(C))

        if (writeRead || writeWrite) addEdge(A.__name!, B.__name!)
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
      R: (s: System) => Set<Class<Component>>,
      W: (s: System) => Set<Class<Component>>,
    ): string {
      const nodes = systems.map(s => s.__name!)
      const cycle = findSmallCycle(nodes, edges)
      let details = `Ciclo/empate RW detectado; a ordem é impossível.\n`
      if (cycle.length) {
        details += `Exemplo: ${cycle.join(" -> ")} -> ${cycle[0]}\n`
        const map = new Map(systems.map(s => [s.__name!, s]))
        const inter = <A>(a: Set<A>, b: Set<A>) => {
          const out = new Set<A>(); for (const x of a) if (b.has(x)) out.add(x); return out
        }
        const reasons: string[] = []
        for (let i = 0; i < cycle.length; i++) {
          const a = map.get(cycle[i])!, b = map.get(cycle[(i + 1) % cycle.length])!
          const rr = inter(W(a), R(b))
          const ww = inter(W(a), W(b))
          const parts = []
          if (rr.size) parts.push(`W(${a.__name!})→R(${b.__name!}) em {${[...rr].map(x => (x as any).name).join(", ")}}`)
          if (ww.size) parts.push(`W(${a.__name!})→W(${b.__name!}) em {${[...ww].map(x => (x as any).name).join(", ")}}`)
          reasons.push(`- ${a.__name!} → ${b.__name!}: ${parts.join(" e ") || "motivo não identificado"}`)
        }
        details += reasons.join("\n")
      }
      return details
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
      const buffers = await Promise.all(level.map(async (system) => {
        const view = new WorldView(this, new Set(system.__read ?? []), system.__name!)
        const buffer = new CommandBuffer(this, new Set(system.__write ?? []), system.__name!)
        await system.execute({ view, buffer, world: this, services: this.serviceManager })
        return buffer
      }))
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
