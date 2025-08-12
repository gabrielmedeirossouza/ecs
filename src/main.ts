import './systems'
import { Email } from "./components/email"
import { PersonName } from "./components/person-name"
import { NeedsCreateStudent } from "./components/student"
import { World } from "./core/world"
import { NeedsAuthorization } from "./components/authorization"
import { UserRef } from "./components/user-ref"
import { GuardianRef } from "./components/guardian-ref"
import { Output } from "./io/output"
import { ResponseRef } from "./components/response-ref"

console.log(World.showOrder())

class ConsoleOutput extends Output {
    send(data: Record<any, any>): void {
        console.log(data)
    }
}

async function main() {
    const world = new World()

    world.provide(new ConsoleOutput())

    const response = world.createEntity("response")

    const user = world.createEntity("user")
    user.add(new PersonName("Gabriel Medeiros Souza"))
    user.add(new Email("gabriel@mail.com"))

    const guardian = world.createEntity("guardian")
    guardian.add(new PersonName("Edmar Ap Oliv Medeiros Souza"))
    guardian.add(new Email("edmar@mail.com"))

    const student = world.createEntity("student")
    student.add(new NeedsCreateStudent())
    student.add(new NeedsAuthorization())
    student.add(new UserRef(user.id))
    student.add(new GuardianRef(guardian.id))
    student.add(new ResponseRef(response.id))

    await world.execute()
}

main()
