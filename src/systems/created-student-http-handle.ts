import { CreatedStudent, CreatedStudentCreated } from "@/components/student"
import { Query, System, SystemContext, Write } from "@/core/system"
import { EntityView } from "@/core/world"

@System
export class CreatedStudentHttpHandle implements System {
    @Query(CreatedStudent)
    @Write(CreatedStudentCreated)
    execute(entity: EntityView, { buffer }: SystemContext) {
        buffer.add(entity, new CreatedStudentCreated(crypto.randomUUID()))
    }
}
