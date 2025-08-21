import { Service } from '../core/service-manager';
import { FastifyRequest } from 'fastify'

export class Request implements Service {
    readonly name = "Request"

    constructor(
        public readonly request: FastifyRequest
    ) {}
}
