import { ValidationFailed } from "@/common/validation"
import { ValidEmail, InvalidEmail, Email, EmailEmpty, EmailMalformed, EmailTooLong } from "@/components/email"
import { Query, System, SystemContext, Write } from "@/core/system"
import { EntityView } from "@/core/world"

@System
export class ValidateEmail implements System {
    private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    private readonly MAX_LENGTH = 254

    @Query(Email)
    @Write(ValidEmail, InvalidEmail, ValidationFailed)
    @Write(EmailEmpty, EmailMalformed, EmailTooLong)
    execute(entity: EntityView, { buffer }: SystemContext) {
        const email = entity.getRO(Email).value

        const empty = !email.length
        const malformed = !email.match(this.EMAIL_REGEX)
        const tooLong = email.length >= this.MAX_LENGTH

        if (empty)
            buffer.add(entity, new EmailEmpty())

        if (malformed)
            buffer.add(entity, new EmailMalformed(email, this.EMAIL_REGEX))

        if (tooLong)
            buffer.add(entity, new EmailTooLong(email, this.MAX_LENGTH, email.length))

        if (empty || malformed || tooLong) {
            buffer.add(entity, new InvalidEmail())
            buffer.add(entity, new ValidationFailed())
        }
        else
            buffer.add(entity, new ValidEmail())
    }
}
