import EmployeeList from "./components/EmployeeList";

export default function EmployeePage() {
  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Employee</h1>
      <EmployeeList></EmployeeList>
    </section>
  );
}
