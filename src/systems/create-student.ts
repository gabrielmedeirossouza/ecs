import { RequestedBy } from "@/components/authorization"
import { Email, InvalidEmail, ValidEmail, EmailEmpty, EmailMalformed, EmailTooLong } from "@/components/email"
import { GuardianRef } from "@/components/guardian-ref"
import { InvalidPersonName, PersonName, ValidPersonName } from "@/components/person-name"
import { ResponseRef } from "@/components/response-ref"
import { NeedsCreateStudent, StudentCreated, StudentNotCreatedValidationFailed } from "@/components/student"
import { UserRef } from "@/components/user-ref"
import { Read, System, SystemContext, Write } from "@/core/system"

@System
export class CreateStudent implements System {
    @Read(NeedsCreateStudent, RequestedBy, UserRef, GuardianRef, ResponseRef)
    @Read(PersonName, ValidPersonName, InvalidPersonName)
    @Read(Email, ValidEmail, InvalidEmail)
    @Read(EmailEmpty, EmailMalformed, EmailTooLong)
    @Write(StudentCreated, StudentNotCreatedValidationFailed)
    execute({ view, buffer }: SystemContext) {
        for (const entity of view.query(NeedsCreateStudent, UserRef, GuardianRef, ResponseRef)) {
            const user = view.getEntity(entity.get(UserRef).id)
            const guardian = view.getEntity(entity.get(GuardianRef).id)

            const validationFailed = user.has(InvalidEmail) || user.has(InvalidPersonName) || guardian.has(InvalidEmail) || guardian.has(InvalidPersonName)
            if (validationFailed) {
                buffer.add(entity, new StudentNotCreatedValidationFailed())
                continue
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
}
