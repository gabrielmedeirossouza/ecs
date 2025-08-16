import { Component } from "./component"
import { Class } from "./utils"

export type ExtendsToken<T extends Component = Component> = {
    __kind: "extends"
    base: Class<T>
}

export function ExtendsOf<T extends Component>(base: Class<T>): ExtendsToken<T> {
    return { __kind: "extends", base }
}

export function isExtendsToken(x: any): x is ExtendsToken {
    return x && x.__kind === "extends"
}

export function isSubOrSame(C: Function, Base: Function) {
    return C === Base || C.prototype instanceof Base
}
