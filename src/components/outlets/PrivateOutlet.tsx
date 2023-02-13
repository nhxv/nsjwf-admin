import { Navigate, Outlet } from "react-router-dom";
import Layout from "../Layout";
import { useAuthStore } from "../../stores/auth.store";

export default function PrivateOutlet() {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  } else {
    return <Navigate to="/not-found" />;
  }
}
