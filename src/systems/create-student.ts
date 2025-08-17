import { ValidationFailed } from "@/common/validation"
import { RequestedBy } from "@/components/authorization"
import { Email, InvalidEmail, ValidEmail, EmailEmpty, EmailMalformed, EmailTooLong } from "@/components/email"
import { GuardianRef } from "@/components/guardian-ref"
import { InvalidPersonName, PersonName, ValidPersonName } from "@/components/person-name"
import { NeedsCreateStudent, CreatedStudent } from "@/components/student"
import { UserRef } from "@/components/user-ref"
import { Query, Read, System, SystemContext, Write } from "@/core/system"
import { EntityView } from "@/core/world"

@System
export class CreateStudent implements System {
    @Query(NeedsCreateStudent, UserRef, GuardianRef)
    @Read(PersonName, Email, ValidationFailed)
    @Write(CreatedStudent)
    execute(entity: EntityView, { world, buffer }: SystemContext) {
        const user = world.getEntityByRef(entity, UserRef)
        const guardian = world.getEntityByRef(entity, GuardianRef)

        const validationFailed = user.has(ValidationFailed) || guardian.has(ValidationFailed)
        if (validationFailed) return

        const dto = {
            user: {
                name: user.get(PersonName).value,
                email: user.get(Email).value
            },
            guardian: {
                name: guardian.get(PersonName).value,
                email: guardian.get(Email)
            }
        }

        buffer.add(entity, new CreatedStudent())
    }
}
