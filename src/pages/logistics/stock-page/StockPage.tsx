import ProductStockFormContainer from "./components/ProductStockFormContainer";

export default function StockPage() {
  return (
    <>
      <section className="min-h-screen">
        <h1 className="text-center font-bold text-xl my-4">Stock</h1>
        <ProductStockFormContainer></ProductStockFormContainer>
      </section>
    </>
  )
}