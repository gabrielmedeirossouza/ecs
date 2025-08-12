import { Authorization, Authorized, Unauthorized } from "@/components/authorization"
import { Email } from "@/components/email"
import { PersonName } from "@/components/person-name"
import { Read, System, SystemContext, Write } from "@/core/system"

@System
export class CheckAuthorization implements System {
  @Read(Authorization, PersonName, Email)
  @Write(Authorized, Unauthorized)
  execute({ view, buffer }: SystemContext) {
    for (const entity of view.query(Authorization)) {
      if (entity.get(Email).value === "admin@mail.com") {
        buffer.add(entity, new Authorized("admin", [], []))
      } else {
        buffer.add(entity, new Unauthorized())
      }
    }
  }
}