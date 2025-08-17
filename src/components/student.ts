import { Created } from "./response"

export class NeedsCreateStudent { }
export class CreatedStudent { }

export class CreatedStudentCreated extends Created {
    constructor(
        public id: string
    ) {
        super()
    }
}
