import { Email, EmailEmpty, EmailEmptyResponseBadRequestData, EmailMalformed, EmailMalformedResponseBadRequestData, EmailTooLong, EmailTooLongResponseBadRequestData, InvalidEmail } from "@/components/email"
import { ResponseBadRequest, ResponseBadRequestDataRef, ResponseRef } from "@/components/response"
import { Query, Read, System, SystemContext, Write } from "@/core/system"
import { EntityView } from "@/core/world"

@System
export class ValidateEmailResponse implements System {
    @Query(Email, InvalidEmail)
    @Read(EmailEmpty, EmailMalformed, EmailTooLong)
    @Write(ResponseBadRequestDataRef, EmailEmptyResponseBadRequestData, EmailMalformedResponseBadRequestData, EmailTooLongResponseBadRequestData)
    execute(entity: EntityView, { buffer }: SystemContext) {
        if (entity.has(EmailEmpty)) {
            const error = new EmailEmptyResponseBadRequestData(
                entity.name,
                "email_empty",
                "Email is required."
            )

            buffer.add(entity, error)
        }

        if (entity.has(EmailMalformed)) {
            const error = new EmailMalformedResponseBadRequestData(
                entity.name,
                "email_malformed",
                "Invalid email format"
            )

            buffer.add(entity, error)
        }

        if (entity.has(EmailTooLong)) {
            const { maxLength } = entity.get(EmailTooLong)

            const error = new EmailTooLongResponseBadRequestData(
                entity.name,
                "email_too_long",
                `The email must have a maximum of ${maxLength} characters.`
            )

            buffer.add(entity, error)
        }
    }
}
