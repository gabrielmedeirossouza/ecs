import { Email, EmailEmpty, EmailEmptyBadRequest, EmailMalformed, EmailMalformedBadRequest, EmailTooLong, EmailTooLongBadRequest, InvalidEmail } from "@/components/email"
import { Query, Read, System, SystemContext, Write } from "@/core/system"
import { EntityView } from "@/core/world"

@System
export class InvalidEmailHttpHandle implements System {
    @Query(Email, InvalidEmail)
    @Read(EmailEmpty, EmailMalformed, EmailTooLong)
    @Write(EmailEmptyBadRequest, EmailMalformedBadRequest, EmailTooLongBadRequest)
    execute(entity: EntityView, { buffer }: SystemContext) {
        if (entity.has(EmailEmpty)) {
            const error = new EmailEmptyBadRequest(
                entity.name,
                "email_empty",
                "Email is required."
            )

            buffer.add(entity, error)
        }

        if (entity.has(EmailMalformed)) {
            const error = new EmailMalformedBadRequest(
                entity.name,
                "email_malformed",
                "Invalid email format"
            )

            buffer.add(entity, error)
        }

        if (entity.has(EmailTooLong)) {
            const { maxLength } = entity.getRO(EmailTooLong)

            const error = new EmailTooLongBadRequest(
                entity.name,
                "email_too_long",
                `The email must have a maximum of ${maxLength} characters.`
            )

            buffer.add(entity, error)
        }
    }
}
