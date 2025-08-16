import { RequestedBy } from "@/components/authorization"
import { Email, InvalidEmail, ValidEmail, EmailEmpty, EmailMalformed, EmailTooLong } from "@/components/email"
import { GuardianRef } from "@/components/guardian-ref"
import { InvalidPersonName, PersonName, ValidPersonName } from "@/components/person-name"
import { ResponseBadRequest } from "@/components/response"
import { NeedsCreateStudent, StudentCreated, StudentNotCreatedValidationFailed } from "@/components/student"
import { UserRef } from "@/components/user-ref"
import { Query, Read, System, SystemContext, Write } from "@/core/system"
import { EntityView } from "@/core/world"

@System
export class CreateStudent implements System {
    @Query(NeedsCreateStudent, UserRef, GuardianRef)
    @Read(RequestedBy)
    @Read(PersonName, ValidPersonName, InvalidPersonName)
    @Read(Email, ValidEmail, InvalidEmail)
    @Read(EmailEmpty, EmailMalformed, EmailTooLong)
    @Write(StudentCreated, StudentNotCreatedValidationFailed, ResponseBadRequest)
    execute(entity: EntityView, { world, buffer }: SystemContext) {
        const user = world.getEntity(entity.get(UserRef).id)
        const guardian = world.getEntity(entity.get(GuardianRef).id)

        const validationFailed = user.has(InvalidEmail) || user.has(InvalidPersonName) || guardian.has(InvalidEmail) || guardian.has(InvalidPersonName)
        if (validationFailed) {
            buffer.add(entity, new StudentNotCreatedValidationFailed())
            buffer.add(entity, new ResponseBadRequest(entity.name, []))
            return
        }

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

        buffer.add(entity, new StudentCreated())
    }
}
