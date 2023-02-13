import VehicleForm from "./components/VehicleForm";
import VehicleSearch from "./components/VehicleSearch";

export default function VehiclePage() {
  return (
    <>
      <section className="flex min-h-screen flex-col items-center">
        <h1 className="my-4 text-xl font-bold">Configure vehicle</h1>
        <div className="custom-card w-11/12 sm:w-8/12 xl:w-6/12">
          <VehicleForm></VehicleForm>
        </div>
        <VehicleSearch></VehicleSearch>
      </section>
    </>
  );
}
