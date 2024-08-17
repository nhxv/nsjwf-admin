import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store";
import CustomerOrderList from "./components/CustomerOrderList";
import { Role } from "../../../commons/enums/role.enum";
import { BiPlus } from "react-icons/bi";

export default function ViewCustomerOrderPage() {
  const role = useAuthStore((state) => state.role);
  const navigate = useNavigate();

  return (
    <section className="min-h-screen">
      {(role === Role.MASTER || role === Role.ADMIN) && (
        <div className="fixed bottom-24 right-6 z-20 md:right-8">
          <button
            type="button"
            className="btn btn-circle btn-primary"
            onClick={() => {
              navigate("/customer/draft-customer-order");
            }}
          >
            <span>
              <BiPlus className="h-8 w-8"></BiPlus>
            </span>
          </button>
        </div>
      )}

      <CustomerOrderList></CustomerOrderList>
    </section>
  );
}
