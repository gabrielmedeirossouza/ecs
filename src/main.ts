import './systems'
import { Email } from "./components/email"
import { PersonName } from "./components/person-name"
import { NeedsCreateStudent } from "./components/student"
import { World } from "./core/world"
import { AuthorizationRef, NeedsAuthorization } from "./components/authorization"
import { UserRef } from "./components/user-ref"
import { GuardianRef } from "./components/guardian-ref"
import { Output } from "./io/output"
import { Request } from "./io/request"
import Fastify, { FastifyReply } from 'fastify'

console.log(World.showOrder())

const fastify = Fastify()

fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})

class FastifyOutput extends Output {
    dispatched = false

    constructor(
        private reply: FastifyReply
    ) {
        super()
    }

    dispatch(data: Record<any, any>): void {
        this.reply.send(data)
        this.dispatched = true
    }
}

fastify.get('/', async function (request, reply) {
    const output = new FastifyOutput(reply)

    const world = new World({
        providers: [
            new Request(request),
            output
        ]
    })

    const authorization = world.createEntity("authorization")
    authorization.add(new NeedsAuthorization())

    const user = world.createEntity("user")
    user.add(new PersonName("Gabriel Medeiros Souza"))
    user.add(new Email("gabriel@mail.com"))

    const guardian = world.createEntity("guardian")
    guardian.add(new PersonName("Edmar Ap Oliv Medeiros Souza"))
    guardian.add(new Email("edmar@mail.com"))

    const requester = world.createEntity("requester")
    requester.add(new NeedsCreateStudent())
    requester.add(new AuthorizationRef(authorization.id))
    requester.add(new UserRef(user.id))
    requester.add(new GuardianRef(guardian.id))

    await world.execute()

    if (!output.dispatched)
        reply.send({
            status: 500,
            data: {
                code: "internal_server_error",
                message: "An error occurred on our servers. Please try again later."
            }
        })
})

fastify.get('/test', async function (request, reply) {
    reply.send({ message: "hello world!" })
})

