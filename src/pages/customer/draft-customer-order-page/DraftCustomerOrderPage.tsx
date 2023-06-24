import CustomerOrderFormContainer from "./components/CustomerOrderFormContainer";

export default function DraftCustomerOrderPage() {
  return (
    <section className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-11/12">
          <CustomerOrderFormContainer></CustomerOrderFormContainer>
        </div>
      </div>
    </section>
  );
}
