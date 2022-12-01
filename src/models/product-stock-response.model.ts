export class ProductStockResponse {
  constructor(
    public productName: string,
    public quantity: number,
    public id?: number,
  ) {}
}