import ProductFormContainer from "./components/ProductFormContainer";

export default function DraftProductPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Draft product</h1>
      <div className="flex justify-center">
        <div className="w-11/12 md:w-10/12 lg:w-6/12">
          <ProductFormContainer></ProductFormContainer>
        </div>
      </div>
    </section>
  );
}
