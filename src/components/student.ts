import { ResponseBadRequest, ResponseOk } from "./response"

export class NeedsCreateStudent { }
export class StudentCreated {}
export class StudentNotCreatedValidationFailed {}

export class StudentCreatedResponseOk extends ResponseOk {
    constructor(
        public message: string
    ) {
        super()
    }
}

export class StudentNotCreatedResponseBadRequest extends ResponseBadRequest {}
