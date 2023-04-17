import CustomerReturnList from "./components/CustomerReturnList";

export default function ViewCustomerReturnPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Customer return</h1>
      <div className="flex justify-center">
        <div className="w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
          <CustomerReturnList />
        </div>
      </div>
    </section>
  );
}
