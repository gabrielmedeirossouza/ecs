import { ValidationFailed } from "@/common/validation"
import { AuthorizationRef, Authorized, NeedsAuthorization } from "@/components/authorization"
import { Email, InvalidEmail, ValidEmail, EmailEmpty, EmailMalformed, EmailTooLong } from "@/components/email"
import { GuardianRef } from "@/components/guardian-ref"
import { InvalidPersonName, PersonName, ValidPersonName } from "@/components/person-name"
import { NeedsCreateStudent, CreatedStudent } from "@/components/student"
import { UserRef } from "@/components/user-ref"
import { Query, QueryRef, Read, System, SystemContext, Write } from "@/core/system"
import { EntityView } from "@/core/world"

@System
export class CreateStudent implements System {
    @Query(NeedsCreateStudent)
    // @Query(QueryRef(AuthorizationRef, Authorized))
    @Query(QueryRef(GuardianRef, { none: [ValidationFailed] }))
    @Query(QueryRef(UserRef, { none: [ValidationFailed] }))
    @Read(Email, PersonName, ValidationFailed)
    @Write(CreatedStudent)
    execute(entity: EntityView, { buffer }: SystemContext) {
        const user = entity.ref(UserRef)
        const guardian = entity.ref(GuardianRef)
        // console.log(world.getEntityByRef(entity, AuthorizationRef))

        // TODO: verificar a mutabilidade da propriedade do componente, se não deveria mudar a ordem de execução dos systems...
        const userName = user.getRO(PersonName)


        buffer.add(entity, new CreatedStudent())
    }
}
