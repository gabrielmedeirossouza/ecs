export class NeedsAuthorization {}

export class RequestedBy {
  constructor(
    public id: number
  ) {}
}

export class Authorized {
  constructor(
    public role: string,
    public permissions: string[],
    public revokes: string[]
  ) {}
}

export class Unauthorized {}