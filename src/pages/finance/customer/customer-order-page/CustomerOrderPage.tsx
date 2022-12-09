import CustomerOrderFormContainer from "./components/CustomerOrderFormContainer";

export default function CustomerOrderPage() {
  return (
  <>
    <section className="min-h-screen">
      <h1 className="text-center font-bold text-xl my-4">Customer order</h1>
      <CustomerOrderFormContainer></CustomerOrderFormContainer>
    </section>
  </>
  )
}