import VehicleForm from "./components/VehicleForm";
import VehicleSearch from "./components/VehicleSearch";

export default function VehiclePage() {
  return (
    <>
      <section className="flex flex-col items-center min-h-screen">
        <h1 className="font-bold text-xl my-4">Configure vehicle</h1>
        <div className="w-11/12 sm:w-8/12 xl:w-6/12 custom-card">
          <VehicleForm></VehicleForm>
        </div>
        <VehicleSearch></VehicleSearch>
      </section>
    </>
  );
}
