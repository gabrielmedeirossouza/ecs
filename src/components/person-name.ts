import { TooLong } from "@/common/validation"
import { BadRequest } from "./response"

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

export class PersonNameEmptyBadRequest extends BadRequest { }
export class PersonNameTooLongBadRequest extends BadRequest { }
export class PersonNameMustContainsLastNameBadRequest extends BadRequest { }
