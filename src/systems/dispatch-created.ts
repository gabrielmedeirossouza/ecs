import { Created } from "@/components/response"
import { ExtendsOf } from "@/core/extends-token"
import { Query, System, SystemContext } from "@/core/system"
import { EntityView } from "@/core/world"
import { Output } from "@/io/output"

@System
export class DispatchCreated implements System {
    @Query(ExtendsOf(Created))
    execute(entity: EntityView, { services, execution }: SystemContext) {
        const output = services.get(Output)

        if (execution.hasMultipleMatches) {
            throw new Error(`[ResponseOverride] There are multiple entities with Created responses: "${execution.matches.join("\", \"")}".`)
        }

        const createdComponents = entity.getComponents(ExtendsOf(Created))
        if (createdComponents.length > 1) {
            const componentsNames = createdComponents.map(c => c.constructor.name).join("\", \"")
            throw new Error(`[ResponseOverride] There are multiple components with Created response within the same entity "${entity.name}": "${componentsNames}"`)
        }

        const createdComponent = createdComponents[0]

        output.send({
            status: 201,
            data: createdComponent
        })
    }
}
