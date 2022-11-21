export class ProductResponse {
  constructor(
    public name: string,
    public discontinued: boolean,
    public id?: number,
  ) {}
}