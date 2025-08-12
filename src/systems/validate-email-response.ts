import { Email, EmailEmpty, EmailEmptyBadRequest, EmailMalformed, EmailMalformedBadRequest, EmailTooLong, EmailTooLongBadRequest, InvalidEmail } from "@/components/email"
import { Response } from '@/components/response'
import { Read, System, SystemContext, Write } from "@/core/system"

@System
export class ValidateEmailResponse implements System {
    @Read(Email, InvalidEmail)
    @Read(EmailEmpty, EmailMalformed, EmailTooLong)
    @Write(EmailEmptyBadRequest, EmailMalformedBadRequest, EmailTooLongBadRequest, Response)
    execute({ view, buffer }: SystemContext) {
        for (const entity of view.query(Email, InvalidEmail)) {
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
                const { maxLength } = entity.get(EmailTooLong)

                const error = new EmailTooLongBadRequest(
                    entity.name,
                    "email_too_long",
                    `The email must have a maximum of ${maxLength} characters.`
                )

                buffer.add(entity, error)
            }
        }
    }
}
