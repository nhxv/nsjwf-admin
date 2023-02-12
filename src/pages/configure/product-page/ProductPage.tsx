import ProductList from "./components/ProductList";

export default function ProductPage() {
  return (
    <section className="min-h-screen">
      <h1 className="font-bold text-xl text-center my-4">Product</h1>
      <ProductList></ProductList>
    </section>
  )
}