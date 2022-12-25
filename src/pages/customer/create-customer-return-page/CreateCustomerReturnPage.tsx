import CreateCustomerReturnFormContainer from "./components/CreateCustomerReturnFormContainer";

export default function CreateCustomerReturnPage() {
  return (
    <>
      <section className="min-h-screen">
        <h1 className="text-center font-bold text-xl my-4">Create customer return</h1>
        <CreateCustomerReturnFormContainer></CreateCustomerReturnFormContainer>
      </section>
    </>
  )
}