export class ProductStockResponse {
  constructor(productName: string, quantity: number, id?: number) {}
}

export interface ProductStockResponse {
  productName: string;
  quantity: number;
  id?: number;
}
