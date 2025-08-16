import { TooLong } from "@/common/validation-errors"
import { ResponseBadRequestData } from "./response"

export class PersonName {
    constructor(
        public value: string
    ) { }
}

export class ValidPersonName { }
export class InvalidPersonName { }

export class PersonNameEmpty { }
export class PersonNameTooLong extends TooLong { }
export class PersonNameMustContainsLastName { }

export class PersonNameEmptyResponseBadRequestData extends ResponseBadRequestData { }
export class PersonNameTooLongResponseBadRequestData extends ResponseBadRequestData { }
export class PersonNameMustContainsLastNameResponseBadRequestData extends ResponseBadRequestData { }
