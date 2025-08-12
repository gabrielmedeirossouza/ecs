import { EntityView } from "@/core/entity-view"
import { ValidationHandler } from "../validation-handler"
import { PersonNameEmpty, PersonNameMustContainsLastName, PersonNameTooLong } from "@/components/person-name"

export class ValidatePersonNameResponse extends ValidationHandler {
    execute(entity: EntityView) {
        if (entity.has(PersonNameEmpty))
            this.add("person_name_empty", "Person name is required.")

        if (entity.has(PersonNameTooLong)) {
            const { maxLength } = entity.get(PersonNameTooLong)

            this.add("person_name_too_long", `Person name must have a maximum of ${maxLength} characters.`)
        }

        if (entity.has(PersonNameMustContainsLastName))
            this.add("person_name_must_contains_last_name", "Person name must be a fullname.")
    }
}
