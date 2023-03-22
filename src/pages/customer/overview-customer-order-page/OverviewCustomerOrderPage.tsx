import { BiSortDown } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import CustomerOrderList from "./components/CustomerOrderList";

export default function OverviewCustomerOrderPage() {
  const navigate = useNavigate();

  const onSwitchView = () => {
    navigate(`/customer/view-customer-order`);
  };

  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Overview</h1>
      <div className="fixed bottom-24 right-6 z-20 md:right-8">
        <button
          className="btn-primary btn-circle btn shadow-md"
          onClick={onSwitchView}
        >
          <span>
            <BiSortDown className="h-6 w-6"></BiSortDown>
          </span>
        </button>
      </div>
      <CustomerOrderList></CustomerOrderList>
    </section>
  );
}
