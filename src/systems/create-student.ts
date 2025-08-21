import { ValidationFailed } from "@/common/validation"
import { AuthorizationRef, Authorized } from "@/components/authorization"
import { Email } from "@/components/email"
import { GuardianRef } from "@/components/guardian-ref"
import { PersonName } from "@/components/person-name"
import { NeedsCreateStudent, StudentCreated } from "@/components/student"
import { UserRef } from "@/components/user-ref"
import { Query, QueryRef, Read, System, SystemContext, Write } from "@/core/system"
import { EntityView } from "@/core/world"

@System
export class CreateStudent implements System {
    @Query(NeedsCreateStudent)
    @Query(QueryRef(AuthorizationRef, Authorized))
    @Query(QueryRef(GuardianRef, { none: [ValidationFailed] }))
    @Query(QueryRef(UserRef, { none: [ValidationFailed] }))
    @Read(Email, PersonName, ValidationFailed)
    @Write(StudentCreated)
    execute(entity: EntityView, { buffer }: SystemContext) {
        const user = entity.ref(UserRef)
        const guardian = entity.ref(GuardianRef)

        const id = crypto.randomUUID()

        buffer.add(entity, new StudentCreated(id))
    }
}
