export class Ok { }

export class Created { }

export class BadRequest {
    constructor(
        public path: string,
        public code: string,
        public message: string
    ) { }
}

export class InternalServerError { }
