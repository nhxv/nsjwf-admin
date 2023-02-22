import CustomerList from "./components/CustomerList";

export default function ViewCustomerPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">View customer</h1>
      <CustomerList></CustomerList>
    </section>
  );
}
