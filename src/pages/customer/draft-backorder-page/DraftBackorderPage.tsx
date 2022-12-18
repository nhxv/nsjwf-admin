import BackorderFormContainer from "./components/BackorderFormContainer";

export default function DraftBackorderPage() {
  return (
    <>
      <section className="min-h-screen">
        <h1 className="text-center font-bold text-xl my-4">Draft backorder</h1>
        <BackorderFormContainer></BackorderFormContainer>
      </section>
    </>
    )  
}