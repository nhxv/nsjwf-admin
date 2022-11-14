import { useAuthStore } from "./stores/auth.store";
import {Routes, Route, Navigate} from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import PrivateOutlet from "./components/outlets/PrivateOutlet";
import ReportPage from "./pages/ReportPage";
import PurchasePage from "./pages/PurchasePage";
import SoldPage from "./pages/SoldPage";
import MasterOutlet from "./components/outlets/MasterOutlet";
import AdminOutlet from "./components/outlets/AdminOutlet";
import NotFoundPage from "./pages/NotFoundPage";
import StockPage from "./pages/StockPage";
import InboundPage from "./pages/InboundPage";
import OutboundPage from "./pages/OutboundPage";
import ProductPage from "./pages/ProductPage";
import VendorPage from "./pages/VendorPage";
import CustomerPage from "./pages/CustomerPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/" element={<Navigate replace to="/sign-in" />}></Route>
        <Route path="/home" element={<Navigate replace to="/sign-in" />}></Route>

        {/* Private routes */}
        <Route element={<PrivateOutlet />}>
          <Route path="profile" element={<ProfilePage />}></Route>

          {/* Finance routes */}
          <Route element={<AdminOutlet />}>
            <Route path="report" element={<ReportPage />}></Route>
          </Route>
          <Route element={<MasterOutlet />}>
            <Route path="purchase" element={<PurchasePage />}></Route>
          </Route>
          <Route path="sold" element={<SoldPage />}></Route>

          {/* Warehouse routes */}
          <Route path="stock" element={<StockPage />}></Route>
          <Route path="inbound" element={<InboundPage />}></Route>
          <Route path="outbound" element={<OutboundPage />}></Route>

          {/* Configure routes */}
          <Route path="products" element={<ProductPage />}></Route>
          <Route path="vendors" element={<VendorPage />}></Route>
          <Route path="customers" element={<CustomerPage />}></Route>
        </Route>
        
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </>
  )
}
