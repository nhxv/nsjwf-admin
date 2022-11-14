import { Role } from "../../commons/role.enum";
import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

export default function AdminOutlet() {
  const role = useAuthStore((state) => state.role);
  
  if (role === Role.MASTER || role === Role.ADMIN) {
    return <Outlet></Outlet>
  } else {
    return <Navigate to="/not-found" />
  }
}