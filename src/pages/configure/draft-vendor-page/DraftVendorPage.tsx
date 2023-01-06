import DraftVendorFormContainer from "./components/DraftVendorFormContainer";

export default function DraftVendorPage() {
  return (
    <>
      <section className="min-h-screen">
        <h1 className="text-center font-bold text-xl my-4">Vendor</h1>
        <DraftVendorFormContainer></DraftVendorFormContainer>
      </section>
    </>
  )  
}