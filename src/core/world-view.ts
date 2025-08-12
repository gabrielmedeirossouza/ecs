import { World } from "./world"
import type { Entity } from "./entity"
import { EntityView } from "./entity-view"
import { Component } from "./component"
import { Class } from "./utils"

type QueryWhere = {
  all?: Array<Class<Component>>
  any?: Array<Class<Component>>
  none?: Array<Class<Component>>
}

export class WorldView {
  constructor(
    private world: World,
    private R: Set<Class<Component>>,
    private systemName: string,
  ) { }

  query(...components: Array<Class<Component>>): EntityView[]
  query(where: QueryWhere): EntityView[]
  query(arg1: any, ...rest: any[]): EntityView[] {
    let where: QueryWhere

    if (typeof arg1 === "function") {
      const classes = [arg1 as Class<Component>, ...rest as Array<Class<Component>>]
      where = { all: classes }
    } else if (Array.isArray(arg1)) {
      where = { all: arg1 as Array<Class<Component>> }
    } else {
      where = arg1 as QueryWhere
    }

    const all = where.all ?? []
    const any = where.any ?? []
    const none = where.none ?? []

    for (const C of [...all, ...any, ...none]) {
      if (!this.R.has(C)) {
        throw new Error(
          `[QueryDenied] System "${this.systemName}" tentou consultar "${C.name}" sem @Read.`
        )
      }
    }

    const entities: Entity[] = this.world._queryUnsafeWhere(where)
    return entities.map(e => new EntityView(e, this.R, this.systemName))
  }

  getEntity(id: number): EntityView {
    const e = this.world.getEntity(id)
    return new EntityView(e, this.R, this.systemName)
  }
}
