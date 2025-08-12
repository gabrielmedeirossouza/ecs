import { EntityView } from "@/core/entity-view"
import { validationError } from "./validation-error"

export abstract class ValidationHandler {
    errors: Record<any, any>[] = []

    constructor(
        private entity: EntityView
    ) { }

    add(code: string, message: string, data?: Record<any, any>) {
        this.errors.push(validationError(this.entity, code, message, data))
    }

    abstract execute(entity: EntityView): void
}
