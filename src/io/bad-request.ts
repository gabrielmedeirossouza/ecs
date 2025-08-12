export class BadRequest {
    constructor(
        public entity: string,
        public code: string,
        public message: string
    ) {}
}
