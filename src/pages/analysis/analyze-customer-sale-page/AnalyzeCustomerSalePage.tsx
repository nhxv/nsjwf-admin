import CustomerSaleFormContainer from "./components/CustomerSaleFormContainer";

export default function AnalyzeCustomerSalePage() {
  return (
    <section className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-11/12 xl:w-8/12">
          <CustomerSaleFormContainer></CustomerSaleFormContainer>
        </div>
      </div>
    </section>
  );
}
