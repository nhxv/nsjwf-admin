import VendorFormContainer from "./components/VendorFormContainer";

export default function DraftVendorPage() {
  return (
    <section className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-11/12 md:w-10/12 lg:w-6/12">
          <VendorFormContainer></VendorFormContainer>
        </div>
      </div>
    </section>
  );
}
