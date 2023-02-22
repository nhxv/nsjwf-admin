import VendorList from "./components/VendorList";

export default function ViewVendorPage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">View vendor</h1>
      <VendorList></VendorList>
    </section>
  );
}
