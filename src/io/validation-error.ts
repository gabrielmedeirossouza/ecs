import { EntityView } from "@/core/entity-view"

export function validationError(entity: EntityView, code: string, message: string, data?: Record<any, any>) {
    const error: { entity: string, code: string, message: string, data?: Record<any, any> } = {
        entity: entity.name,
        code,
        message
    }

    if (data)
        error.data = data

    return error
}
