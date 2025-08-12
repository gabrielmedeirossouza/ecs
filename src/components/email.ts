import { Malformed, TooLong } from "@/common/validation-errors"
import { BadRequest } from "@/io/bad-request"

export class Email {
  constructor(
    public value: string
  ) { }
}

export class ValidEmail { }
export class InvalidEmail { }

export class EmailEmpty {}
export class EmailMalformed extends Malformed {}
export class EmailTooLong extends TooLong {}

export class EmailEmptyBadRequest extends BadRequest {}
export class EmailMalformedBadRequest extends BadRequest {}
export class EmailTooLongBadRequest extends BadRequest {}
