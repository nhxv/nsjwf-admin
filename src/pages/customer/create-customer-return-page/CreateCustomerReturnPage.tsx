import CreateCustomerReturnFormContainer from "./components/CreateCustomerReturnFormContainer";

export default function CreateCustomerReturnPage() {
  return (
    <section className="min-h-screen">
      <h1 className="text-center font-bold text-xl my-4">Create customer return</h1>
      <div className="flex justify-center">
        <div className="w-11/12 sm:w-8/12 xl:w-6/12">
          <CreateCustomerReturnFormContainer></CreateCustomerReturnFormContainer>
        </div>
      </div>
    </section>
  );
}