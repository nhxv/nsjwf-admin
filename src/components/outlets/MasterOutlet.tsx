import { Role } from "../../commons/role.enum";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

export default function MasterOutlet() {
  const role = useAuthStore((state) => state.role);

  if (role === Role.MASTER) {
    return <Outlet></Outlet>;
  } else {
    return <Navigate to="/not-found" />;
  }
}
