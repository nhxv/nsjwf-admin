import ProductList from "./components/ProductList";

export default function ProductPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Product</h1>
      <ProductList></ProductList>
    </section>
  );
}
