import { useNavigate } from "react-router-dom";
import { Role } from "../../../commons/enums/role.enum";
import { useAuthStore } from "../../../stores/auth.store";
import VendorOrderList from "./components/VendorOrderList";
import { BiPlus } from "react-icons/bi";

export default function ViewVendorOrderPage() {
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
              navigate("/vendor/draft-vendor-order");
            }}
          >
            <span>
              <BiPlus className="h-8 w-8"></BiPlus>
            </span>
          </button>
        </div>
      )}
      <VendorOrderList></VendorOrderList>
    </section>
  );
}
