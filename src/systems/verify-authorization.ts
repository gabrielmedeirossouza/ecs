import { Authorized, NeedsAuthorization, Unauthorized } from "@/components/authorization"
import { Query, System, SystemContext, Write } from "@/core/system"
import { Request } from '@/io/request'
import { EntityView } from "@/core/world"

@System
export class VerifyAuthentication implements System {
    @Query(NeedsAuthorization)
    @Write(Authorized, Unauthorized)
    execute(entity: EntityView, { buffer, services }: SystemContext) {
        const request = services.get(Request)

        console.log(request.request.headers)

    }
}
