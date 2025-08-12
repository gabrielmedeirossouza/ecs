import { EmailEmpty, EmailMalformed, EmailTooLong } from "@/components/email"
import { EntityView } from "@/core/entity-view"
import { ValidationHandler } from "../validation-handler"

export class ValidateEmailResponse extends ValidationHandler {
    execute(entity: EntityView) {
        if (entity.has(EmailEmpty))
            this.add("email_empty", "Email is required.")

        if (entity.has(EmailMalformed))
            this.add("email_malformed", "Invalid email format.")

        if (entity.has(EmailTooLong)) {
            const { maxLength } = entity.get(EmailTooLong)

            this.add("email_too_long", `The email must have a maximum of ${maxLength} characters.`)
        }
    }
}
