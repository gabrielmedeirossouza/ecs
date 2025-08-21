export class Ok { }

export class BadRequest {
    constructor(
        public path: string,
        public code: string,
        public message: string
    ) { }
}

export class Unauthenticated {}

export class Unauthorized {}

export class InternalServerError { }
