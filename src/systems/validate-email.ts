import { ValidEmail, InvalidEmail, Email, EmailEmpty, EmailMalformed, EmailTooLong } from "@/components/email"
import { Read, System, SystemContext, Write } from "@/core/system"

@System
export class ValidateEmail implements System {
    private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    private readonly MAX_LENGTH = 254

    @Read(Email)
    @Write(ValidEmail, InvalidEmail)
    @Write(EmailEmpty, EmailMalformed, EmailTooLong)
    execute({ view, buffer }: SystemContext) {
        for (const entity of view.query(Email)) {
            const email = entity.get(Email).value

            const empty = !email.length
            const malformed = !email.match(this.EMAIL_REGEX)
            const tooLong = email.length >= this.MAX_LENGTH

            if (empty)
                buffer.add(entity, new EmailEmpty())

            if (malformed)
                buffer.add(entity, new EmailMalformed(email, this.EMAIL_REGEX))

            if (tooLong)
                buffer.add(entity, new EmailTooLong(email, this.MAX_LENGTH, email.length))

            if (empty || malformed || tooLong)
                buffer.add(entity, new InvalidEmail())
            else
                buffer.add(entity, new ValidEmail())
        }
    }
}
