import ProductList from "./components/ProductList";

export default function ViewProductPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">View product</h1>
      <ProductList></ProductList>
    </section>
  );
}
