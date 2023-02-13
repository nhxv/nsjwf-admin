import DraftVendorFormContainer from "./components/DraftVendorFormContainer";

export default function DraftVendorPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Draft vendor</h1>
      <div className="flex justify-center">
        <div className="w-11/12 sm:w-8/12 xl:w-6/12">
          <DraftVendorFormContainer></DraftVendorFormContainer>
        </div>
      </div>
    </section>
  );
}
