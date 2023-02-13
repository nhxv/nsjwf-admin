import EmployeeList from "./components/EmployeeList";

export default function EmployeePage() {
  return (
    <section className="min-h-screen">
      <h1 className="font-bold text-xl text-center my-4">Employee</h1>
      <EmployeeList></EmployeeList>
    </section>
  );
}
