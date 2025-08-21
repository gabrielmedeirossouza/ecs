import { BadRequest } from "@/components/response"
import { ExtendsOf } from "@/core/extends-token"
import { Query, System, SystemContext } from "@/core/system"
import { EntityView } from "@/core/world"
import { Output } from "@/io/output"

@System
export class DispatchBadRequest implements System {
    private badRequestData: BadRequest[] = []

    @Query(ExtendsOf(BadRequest))
    execute(entity: EntityView, { services, execution }: SystemContext) {
        const errors = entity.getComponentsRO(ExtendsOf(BadRequest))
        this.badRequestData.push(...errors)

        if (execution.isLastMatch) {
            const output = services.get(Output)

            const message = this.badRequestData.length > 1
                ? `There are ${this.badRequestData.length} validation errors.`
                : `There is 1 validation error.`

            output.dispatch({
                status: 400,
                data: {
                    code: "bad_request",
                    message,
                    errors: this.badRequestData
                }
            })
        }
    }
}
