import CreateVendorReturnFormContainer from "./components/CreateVendorReturnFormContainer";

export default function CreateVendorReturnPage() {
  return (
    <>
      <section className="min-h-screen">
        <h1 className="text-center font-bold text-xl my-4">Create vendor return</h1>
        <CreateVendorReturnFormContainer></CreateVendorReturnFormContainer>
      </section>
    </>
  )
}