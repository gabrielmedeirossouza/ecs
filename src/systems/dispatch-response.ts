import { ResponseBadRequest, ResponseBadRequestData } from "@/components/response"
import { ExtendsOf } from "@/core/extends-token"
import { Query, Read, System, SystemContext } from "@/core/system"
import { EntityView } from "@/core/world"
import { Output } from "@/io/output"

@System
export class DispatchResponse implements System {
    @Query({ any: [ExtendsOf(ResponseBadRequest)] })
    @Read(ResponseBadRequestData, ResponseBadRequest)
    execute(entity: EntityView, { world, services }: SystemContext) {
        if (entity.has(ResponseBadRequest)) {
            const badRequest = entity.get(ResponseBadRequest)
            const errors = world.getComponents(ExtendsOf(ResponseBadRequestData))
            // services.get(Output).send({
            //     entity: badRequest.entity,
            //     errors
            // })
        }
    }
}
