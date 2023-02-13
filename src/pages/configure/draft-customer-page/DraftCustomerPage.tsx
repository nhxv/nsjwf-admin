import DraftCustomerFormContainer from "./components/DraftCustomerFormContainer";

export default function DraftCustomerPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Draft customer</h1>
      <div className="flex justify-center">
        <div className="w-11/12 sm:w-8/12 xl:w-6/12">
          <DraftCustomerFormContainer></DraftCustomerFormContainer>
        </div>
      </div>
    </section>
  );
}
