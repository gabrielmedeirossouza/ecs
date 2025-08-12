import { ValidationHandler } from "./validation-handler"

export class ValidationManager {
    private handlers: ValidationHandler[]

    constructor(
        ...handlers: ValidationHandler[]
    ) {
        this.handlers = handlers

        for (const handler of handlers) {
            handler.execute()
        }
    }

    get hasError() {
        return this.handlers.some(handler => handler.errors.length >= 1)
    }

    get errors () {
        return this.handlers.flatMap(handler => handler.errors)
    }
}
