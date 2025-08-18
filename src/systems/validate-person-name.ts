import { ValidationFailed } from "@/common/validation"
import { InvalidPersonName, PersonName, PersonNameEmpty, PersonNameMustContainsLastName, PersonNameTooLong, ValidPersonName } from "@/components/person-name"
import { Query, System, SystemContext, Write } from "@/core/system"
import { EntityView } from "@/core/world"

@System
export class ValidatePersonName implements System {
    private readonly MAX_LENGTH = 250

    @Query(PersonName)
    @Write(ValidPersonName, InvalidPersonName, ValidationFailed)
    @Write(PersonNameEmpty, PersonNameTooLong, PersonNameMustContainsLastName)
    execute(entity: EntityView, { buffer }: SystemContext) {
        const personName = entity.getRO(PersonName).value

        const empty = !personName.length
        const tooLong = personName.length >= this.MAX_LENGTH
        const notContainsLastName = personName.trim().split(" ").length <= 1

        if (empty)
            buffer.add(entity, new PersonNameEmpty())

        if (tooLong)
            buffer.add(entity, new PersonNameTooLong(personName, this.MAX_LENGTH, personName.length))

        if (notContainsLastName)
            buffer.add(entity, new PersonNameMustContainsLastName())

        if (empty || tooLong || notContainsLastName) {
            buffer.add(entity, new InvalidPersonName())
            buffer.add(entity, new ValidationFailed())
        }
        else
            buffer.add(entity, new ValidPersonName())
    }
}
