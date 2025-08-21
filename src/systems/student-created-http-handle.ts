import { HttpStudentCreated, StudentCreated } from "@/components/student"
import { Query, System, SystemContext, Write } from "@/core/system"
import { EntityView } from "@/core/world"

@System
export class StudentCreatedHttpHandle implements System {
    @Query(StudentCreated)
    @Write(HttpStudentCreated)
    execute(entity: EntityView, { buffer }: SystemContext) {
        const { id } = entity.getRO(StudentCreated)

        buffer.add(entity, new HttpStudentCreated(id))
    }
}
