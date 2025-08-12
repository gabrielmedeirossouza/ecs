import { EmailEmptyBadRequest, EmailMalformedBadRequest, EmailTooLongBadRequest } from "@/components/email"
import { GuardianRef } from "@/components/guardian-ref"
import { PersonNameEmptyBadRequest, PersonNameMustContainsLastNameBadRequest, PersonNameTooLongBadRequest } from "@/components/person-name"
import { StudentCreated, StudentNotCreatedValidationFailed } from "@/components/student"
import { UserRef } from "@/components/user-ref"
import { Read, System, SystemContext } from "@/core/system"
import { Output } from "@/io/output"

@System
export class CreateStudentResponse implements System {
    @Read(StudentCreated, StudentNotCreatedValidationFailed, UserRef, GuardianRef)
    @Read(EmailEmptyBadRequest, EmailTooLongBadRequest, EmailMalformedBadRequest)
    @Read(PersonNameEmptyBadRequest, PersonNameTooLongBadRequest, PersonNameMustContainsLastNameBadRequest)
    execute({ view, services }: SystemContext) {
        const output = services.get(Output)

        for (const entity of view.query({ any: [StudentCreated, StudentNotCreatedValidationFailed] })) {
            if (entity.has(StudentCreated)) {
                output.send({
                    message: "Estudante criado com sucesso!"
                })

                continue
            }

            const user = view.getEntity(entity.get(UserRef).id)
            const guardian = view.getEntity(entity.get(GuardianRef).id)

            output.send({
                code: "validation_failed",
                message: "Cannot create student. Validation failed.",
                errors: [
                    user.attemptGet(EmailEmptyBadRequest),
                    user.attemptGet(EmailTooLongBadRequest),
                    user.attemptGet(EmailMalformedBadRequest),
                    user.attemptGet(PersonNameEmptyBadRequest),
                    user.attemptGet(PersonNameTooLongBadRequest),
                    user.attemptGet(PersonNameMustContainsLastNameBadRequest),
                    guardian.attemptGet(EmailEmptyBadRequest),
                    guardian.attemptGet(EmailTooLongBadRequest),
                    guardian.attemptGet(EmailMalformedBadRequest),
                    guardian.attemptGet(PersonNameEmptyBadRequest),
                    guardian.attemptGet(PersonNameTooLongBadRequest),
                    guardian.attemptGet(PersonNameMustContainsLastNameBadRequest),
                ].filter(Boolean)
            })
        }
    }
}
