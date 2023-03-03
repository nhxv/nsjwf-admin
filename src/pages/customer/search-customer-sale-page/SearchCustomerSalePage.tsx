import SearchCustomerSaleForm from "./components/SearchCustomerSaleForm";

export default function SearchCustomerSalePage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Search sale</h1>
      <div className="mb-8 flex flex-col items-center">
        <SearchCustomerSaleForm></SearchCustomerSaleForm>
      </div>
    </section>
  );
}
