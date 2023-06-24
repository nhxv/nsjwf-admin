import { BiSearch } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import CustomerSaleList from "./components/CustomerSaleList";

export default function ReportCustomerSalePage() {
  const navigate = useNavigate();

  const onSearch = () => {
    navigate(`/customer/search-customer-sale`);
  };

  return (
    <section className="min-h-screen">
      <div className="flex flex-col items-center">
        <div className="fixed bottom-24 right-6 z-20 md:right-8">
          <button className="btn-accent btn-circle btn" onClick={onSearch}>
            <span>
              <BiSearch className="h-6 w-6"></BiSearch>
            </span>
          </button>
        </div>
        <div className="w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
          <CustomerSaleList />
        </div>
      </div>
    </section>
  );
}
