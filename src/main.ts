import './systems'
import { Email } from "./components/email"
import { PersonName } from "./components/person-name"
import { NeedsCreateStudent } from "./components/student"
import { World } from "./core/world"
import { NeedsAuthorization } from "./components/authorization"
import { UserRef } from "./components/user-ref"
import { GuardianRef } from "./components/guardian-ref"
import { Output } from "./io/output"

console.log(World.showOrder())

class ConsoleOutput extends Output {
    send(data: Record<any, any>): void {
        console.log(
            JSON.stringify(data, null, 4)
        )
    }
}

async function main() {
    const world = new World()

    world.provide(new ConsoleOutput())

    const response = world.createEntity("response")
    response.add(new Response())

    const user = world.createEntity("user")
    user.add(new PersonName("Gabriel Medeiros Souza"))
    user.add(new Email("gabriel@mail.com"))

    const guardian = world.createEntity("guardian")
    guardian.add(new PersonName("Edmar Ap Oliv Medeiros Souza"))
    guardian.add(new Email("edmar@mail.com"))

    const request = world.createEntity("request")
    request.add(new NeedsCreateStudent())
    request.add(new NeedsAuthorization())
    request.add(new UserRef(user.id))
    request.add(new GuardianRef(guardian.id))

    await world.execute()

}

main()
