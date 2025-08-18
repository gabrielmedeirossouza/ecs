import { InvalidPersonName, PersonName, PersonNameEmpty, PersonNameEmptyBadRequest, PersonNameMustContainsLastName, PersonNameMustContainsLastNameBadRequest, PersonNameTooLong, PersonNameTooLongBadRequest } from "@/components/person-name"
import { Query, Read, System, SystemContext, Write } from "@/core/system"
import { EntityView } from "@/core/world"

@System
export class InvalidPersonNameHttpHandle implements System {
    @Query(PersonName, InvalidPersonName)
    @Read(PersonNameEmpty, PersonNameTooLong, PersonNameMustContainsLastName)
    @Write(PersonNameEmptyBadRequest, PersonNameTooLongBadRequest, PersonNameMustContainsLastNameBadRequest)
    execute(entity: EntityView, { buffer }: SystemContext) {
        if (entity.has(PersonNameEmpty)) {
            const error = new PersonNameEmptyBadRequest(
                entity.name,
                "person_name_empty",
                "Person name is required."
            )

            buffer.add(entity, error)
        }

        if (entity.has(PersonNameTooLong)) {
            const { maxLength } = entity.getRO(PersonNameTooLong)

            const error = new PersonNameTooLongBadRequest(
                entity.name,
                "person_name_too_long",
                `Person name must have a maximum of ${maxLength} characters.`
            )

            buffer.add(entity, error)
        }

        if (entity.has(PersonNameMustContainsLastName)) {
            const error = new PersonNameMustContainsLastNameBadRequest(
                entity.name,
                "person_name_must_contains_last_name",
                "Person name must be a fullname."
            )

            buffer.add(entity, error)
        }
    }
}
