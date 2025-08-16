import { InvalidPersonName, PersonName, PersonNameEmpty, PersonNameEmptyResponseBadRequestData, PersonNameMustContainsLastName, PersonNameMustContainsLastNameResponseBadRequestData, PersonNameTooLong, PersonNameTooLongResponseBadRequestData } from "@/components/person-name"
import { ResponseBadRequestDataRef } from "@/components/response"
import { Read, System, SystemContext, Write } from "@/core/system"

// @System
export class ValidatePersonNameResponse implements System {
    @Read(PersonName, InvalidPersonName)
    @Read(PersonNameEmpty, PersonNameTooLong, PersonNameMustContainsLastName)
    @Write(ResponseBadRequestDataRef, PersonNameEmptyResponseBadRequestData, PersonNameTooLongResponseBadRequestData, PersonNameMustContainsLastNameResponseBadRequestData)
    execute({ view, world, buffer }: SystemContext) {
        for (const entity of view.query(PersonName, InvalidPersonName)) {
            const response = world.createEntity(`${entity.name}:person_name_response`)
            buffer.add(entity, new ResponseBadRequestDataRef(response.id))

            if (entity.has(PersonNameEmpty)) {
                const error = new PersonNameEmptyResponseBadRequestData(
                    entity.name,
                    "person_name_empty",
                    "Person name is required."
                )

                buffer.add(response, error)
            }

            if (entity.has(PersonNameTooLong)) {
                const { maxLength } = entity.get(PersonNameTooLong)

                const error = new PersonNameTooLongResponseBadRequestData(
                    entity.name,
                    "person_name_too_long",
                    `Person name must have a maximum of ${maxLength} characters.`
                )

                buffer.add(response, error)
            }

            if (entity.has(PersonNameMustContainsLastName)) {
                const error = new PersonNameMustContainsLastNameResponseBadRequestData(
                    entity.name,
                    "person_name_must_contains_last_name",
                    "Person name must be a fullname."
                )

                buffer.add(response, error)
            }
        }
    }
}
