import CustomerOrderFormContainer from "./components/CustomerOrderFormContainer";

export default function DraftCustomerOrderPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Customer order</h1>
      <div className="flex justify-center">
        <div className="w-11/12 sm:w-8/12 xl:w-6/12">
          <CustomerOrderFormContainer></CustomerOrderFormContainer>
        </div>
      </div>
    </section>
  );
}
