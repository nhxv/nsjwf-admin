export class SignInResponse {
  constructor(
    public username: string,
    public roleId: number,
    public token: string,
  ) {}
}