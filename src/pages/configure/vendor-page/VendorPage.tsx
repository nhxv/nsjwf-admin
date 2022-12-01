import VendorForm from "./components/VendorForm";
import VendorSearch from "./components/VendorSearch";

export default function VendorPage() {
  return (
    <>
      <section className="flex flex-col items-center min-h-screen">
        <h1 className="font-bold text-xl my-4">Configure vendor</h1>
        <div className="w-11/12 sm:w-6/12 md:w-5/12 bg-white p-6 rounded-box shadow-md">
          <VendorForm></VendorForm>
        </div>
        <VendorSearch></VendorSearch>
      </section>
    </>
  )
}