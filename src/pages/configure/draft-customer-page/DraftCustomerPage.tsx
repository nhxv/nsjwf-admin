import DraftCustomerFormContainer from "./components/DraftCustomerFormContainer";

export default function DraftCustomerPage() {
  return (
    <>
      <section className="min-h-screen">
        <h1 className="text-center font-bold text-xl my-4">Customer</h1>
        <DraftCustomerFormContainer></DraftCustomerFormContainer>
      </section>
    </>
  )  
}