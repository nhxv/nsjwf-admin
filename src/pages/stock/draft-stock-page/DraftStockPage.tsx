import ProductStockFormContainer from "./components/ProductStockFormContainer";

export default function DraftStockPage() {
  return (
    <>
      <section className="min-h-screen">
        <h1 className="text-center font-bold text-xl my-4">Change stock</h1>
        <ProductStockFormContainer></ProductStockFormContainer>
      </section>
    </>
  )
}