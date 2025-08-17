export class ValidationFailed {}

export abstract class Malformed {
  constructor(
    public value: string,
    public expectedPattern: RegExp
  ) { }
}

export abstract class TooLong {
  constructor(
    public value: string,
    public maxLength: number,
    public currentLength: number
  ) { }
}
