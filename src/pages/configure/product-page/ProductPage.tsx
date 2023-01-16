import ProductForm from "./components/ProductForm";
import ProductSearch from "./components/ProductSearch";

export default function ProductPage() {
  return (
    <>
      <section className="flex flex-col items-center min-h-screen">
        <h1 className="font-bold text-xl my-4">Configure product</h1>
        <div className="w-11/12 sm:w-8/12 xl:w-6/12 custom-card">
          <ProductForm></ProductForm>
        </div>
        <ProductSearch></ProductSearch>
      </section>
    </>
  )
}