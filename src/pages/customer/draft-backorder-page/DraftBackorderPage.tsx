import BackorderFormContainer from "./components/BackorderFormContainer";

export default function DraftBackorderPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Draft backorder</h1>
      <div className="flex justify-center">
        <div className="w-11/12 sm:w-8/12 xl:w-6/12">
          <BackorderFormContainer></BackorderFormContainer>
        </div>
      </div>
    </section>
  );
}
