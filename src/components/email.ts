import { Malformed, TooLong } from "@/common/validation-errors"
import { ResponseBadRequestData } from "./response"

export class Email {
    constructor(
        public value: string
    ) { }
}

export class ValidEmail { }
export class InvalidEmail { }

export class EmailEmpty { }
export class EmailMalformed extends Malformed { }
export class EmailTooLong extends TooLong { }

export class EmailEmptyResponseBadRequestData extends ResponseBadRequestData { }
export class EmailMalformedResponseBadRequestData extends ResponseBadRequestData { }
export class EmailTooLongResponseBadRequestData extends ResponseBadRequestData { }
