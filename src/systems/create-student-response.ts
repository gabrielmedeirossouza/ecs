import { EmailEmptyResponseBadRequestData, EmailMalformedResponseBadRequestData, EmailTooLongResponseBadRequestData } from "@/components/email"
import { GuardianRef } from "@/components/guardian-ref"
import { PersonNameEmptyResponseBadRequestData, PersonNameMustContainsLastNameResponseBadRequestData, PersonNameTooLongResponseBadRequestData } from "@/components/person-name"
import { ResponseBadRequestRef, ResponseOkRef } from "@/components/response"
import { StudentCreated, StudentCreatedOk, StudentNotCreatedBadRequest, StudentNotCreatedValidationFailed } from "@/components/student"
import { UserRef } from "@/components/user-ref"
import { Read, System, SystemContext, Write } from "@/core/system"

// @System
export class CreateStudentResponse implements System {
    @Read(StudentCreated, StudentNotCreatedValidationFailed, UserRef, GuardianRef)
    @Read(EmailEmptyResponseBadRequestData, EmailTooLongResponseBadRequestData, EmailMalformedResponseBadRequestData)
    @Read(PersonNameEmptyResponseBadRequestData, PersonNameTooLongResponseBadRequestData, PersonNameMustContainsLastNameResponseBadRequestData)
    @Write(StudentCreatedOk, StudentNotCreatedBadRequest, ResponseBadRequestRef, ResponseOkRef)
    execute({ view, buffer, world }: SystemContext) {
        for (const entity of view.query({ any: [StudentCreated, StudentNotCreatedValidationFailed] })) {
            const response = world.createEntity(`${entity.name}:create_student_response`)

            if (entity.has(StudentCreated)) {
                buffer.add(entity, new StudentCreatedOk("Estudante criado com sucesso!"))

                continue
            }

            buffer.add(entity, new StudentNotCreatedBadRequest(entity.name))
        }
    }
}
