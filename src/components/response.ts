import { Ref } from "@/common/ref"

export class Response {
    constructor(
        public dataRef: number[]
    ) {}
}

export class ResponseRef extends Ref {}

export class ResponseOk { }
export class ResponseOkRef extends Ref { }

export class ResponseCreated { }
export class ResponseCreatedRef extends Ref {}

export class ResponseBadRequest {
    constructor(
        public entity: string,
        public data: { path: string, code: string, message: string }[]
    ) { }
}
export class ResponseBadRequestRef extends Ref {}

export class ResponseBadRequestData {
    constructor(
        public entity: string,
        public code: string,
        public message: string
    ) { }
}
export class ResponseBadRequestDataRef extends Ref {}

export class ResponseInternalServerError { }
export class ResponseInternalServerErrorRef extends Ref { }

export class StatusCode {
    constructor(
        public value: number
    ) { }

    static ok() {
        return new StatusCode(200)
    }

    static created() {
        return new StatusCode(201)
    }

    static badRequest() {
        return new StatusCode(400)
    }

    static internalServerError() {
        return new StatusCode(500)
    }
}

