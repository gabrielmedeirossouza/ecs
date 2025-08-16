import { InternalServerError } from "@/components/response"
import { ExtendsOf } from "@/core/extends-token"
import { Query, System, SystemContext } from "@/core/system"
import { EntityView } from "@/core/world"
import { Output } from "@/io/output"

@System
export class DispatchInternalServerError implements System {
    @Query(ExtendsOf(InternalServerError))
    execute(_: EntityView, { services }: SystemContext) {
        const output = services.get(Output)

        output.send({
            status: 500,
            data: {
                code: "internal_server_error",
                message: "An error occurred on our servers. Please try again later."
            }
        })
    }
}
