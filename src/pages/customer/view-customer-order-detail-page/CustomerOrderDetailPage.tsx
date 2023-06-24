import CustomerOrderDetail from "./components/CustomerOrderDetail";

export default function CustomerOrderDetailPage() {
  return (
    <section className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
          <CustomerOrderDetail></CustomerOrderDetail>
        </div>
      </div>
    </section>
  );
}
