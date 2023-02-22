import BackorderFormContainer from "./components/BackorderFormContainer";

export default function DraftBackorderPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Draft backorder</h1>
      <div className="flex justify-center">
        <div className="w-11/12 md:w-10/12 lg:w-6/12">
          <BackorderFormContainer></BackorderFormContainer>
        </div>
      </div>
    </section>
  );
}
