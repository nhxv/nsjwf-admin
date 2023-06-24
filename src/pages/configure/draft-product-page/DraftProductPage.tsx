import ProductFormContainer from "./components/ProductFormContainer";

export default function DraftProductPage() {
  return (
    <section className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-11/12 md:w-10/12 lg:w-6/12">
          <ProductFormContainer></ProductFormContainer>
        </div>
      </div>
    </section>
  );
}
