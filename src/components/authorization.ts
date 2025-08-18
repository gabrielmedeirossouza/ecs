import { Ref } from "@/common/ref"

export class NeedsAuthorization {}

export class AuthorizationRef extends Ref {}

export class Authorized {
  constructor(
    public role: string,
    public permissions: string[],
    public revokes: string[]
  ) {}
}

export class Unauthorized {}
