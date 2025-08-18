import { Ok } from "@/components/response"
import { ExtendsOf } from "@/core/extends-token"
import { Query, System, SystemContext } from "@/core/system"
import { EntityView } from "@/core/world"
import { Output } from "@/io/output"

@System
export class DispatchOk implements System {
    @Query(ExtendsOf(Ok))
    execute(entity: EntityView, { services, execution }: SystemContext) {
        const output = services.get(Output)

        if (execution.hasMultipleMatches) {
            throw new Error(`[ResponseOverride] There are multiple entities with Ok responses: "${execution.matches.join("\", \"")}".`)
        }

        const okComponents = entity.getComponentsRO(ExtendsOf(Ok))
        if (okComponents.length > 1) {
            const componentsNames = okComponents.map(c => c.constructor.name).join("\", \"")
            throw new Error(`[ResponseOverride] There are multiple components with Ok response within the same entity "${entity.name}": "${componentsNames}"`)
        }

        const okComponent = okComponents[0]

        output.send({
            status: 200,
            data: okComponent
        })
    }
}
