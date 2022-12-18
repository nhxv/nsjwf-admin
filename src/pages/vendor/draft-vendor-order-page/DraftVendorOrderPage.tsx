import VendorOrderFormContainer from "./components/VendorOrderFormContainer";

export default function DraftVendorOrderPage() {

  return (
  <>
    <section className="min-h-screen">
      <h1 className="text-center font-bold text-xl my-4">Vendor order</h1>
      <VendorOrderFormContainer></VendorOrderFormContainer>
    </section>
  </>
  )
}