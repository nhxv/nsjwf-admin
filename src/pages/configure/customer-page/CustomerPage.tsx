import CustomerForm from "./components/CustomerForm";
import CustomerSearch from "./components/CustomerSearch";

export default function CustomerPage() {
  return (
    <>
      <section className="flex flex-col items-center min-h-screen">
        <h1 className="font-bold text-xl my-4">Configure customer</h1>
        <div className="w-11/12 sm:w-6/12 md:w-5/12 bg-base-100 p-6 rounded-box shadow-md">
          <CustomerForm></CustomerForm>
        </div>
        <CustomerSearch></CustomerSearch>
      </section>
    </>
  )
}