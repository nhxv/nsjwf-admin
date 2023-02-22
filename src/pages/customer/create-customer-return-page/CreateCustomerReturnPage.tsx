import CreateCustomerReturnFormContainer from "./components/CreateCustomerReturnFormContainer";

export default function CreateCustomerReturnPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">
        Create customer return
      </h1>
      <div className="flex justify-center">
        <div className="w-11/12 md:w-8/12 lg:w-6/12">
          <CreateCustomerReturnFormContainer></CreateCustomerReturnFormContainer>
        </div>
      </div>
    </section>
  );
}
