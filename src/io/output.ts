import { Service } from "@/core/service-manager"

export abstract class Output implements Service {
    readonly name = 'Output'

    abstract send(data: Record<any, any>): void
}
