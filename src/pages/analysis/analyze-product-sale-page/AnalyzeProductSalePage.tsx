import ProductSaleFormContainer from "./components/ProductSaleFormContainer";

export default function AnalyzeProductSalePage() {
  return (
    <section className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-11/12">
          <ProductSaleFormContainer></ProductSaleFormContainer>
        </div>
      </div>
    </section>
  );
}
