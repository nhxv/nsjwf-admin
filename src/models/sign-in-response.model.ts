export class SignInResponse {
  constructor(
    public nickname: string,
    public roleId: number,
    public token: string,
  ) {}
}