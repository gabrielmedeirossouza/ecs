export class Response {}

export class BadRequest {
    constructor(
        public code: string,
        public message: string,
        public entitiesRef: number[]
    ) {}
}

export class StatusCode {
    constructor(
        public value: number
    ) {}

    static ok() {
        return new StatusCode(200)
    }

    static created() {
        return new StatusCode(201)
    }

    static badRequest() {
        return new StatusCode(400)
    }
}
