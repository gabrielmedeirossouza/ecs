import { Ok } from "./response"

export class NeedsCreateStudent { }

export class StudentCreated {
    constructor(
        public id: string
    ) {}
}

export class HttpStudentCreated extends Ok {
    constructor(
        public id: string
    ) {
        super()
    }
}
