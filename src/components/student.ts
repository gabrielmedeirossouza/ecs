import { Ok, BadRequest } from "./response"

export class NeedsCreateStudent { }
export class StudentCreated extends Ok {}
export class StudentNotCreatedValidationFailed {}

export class StudentCreatedOk extends Ok {
    constructor(
        public message: string
    ) {
        super()
    }
}

export class StudentNotCreatedBadRequest extends BadRequest {}
