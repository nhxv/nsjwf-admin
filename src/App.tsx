import {Routes, Route, Navigate} from "react-router-dom";

import MasterOutlet from "./components/outlets/MasterOutlet";
import AdminOutlet from "./components/outlets/AdminOutlet";
import PrivateOutlet from "./components/outlets/PrivateOutlet";

import SignInPage from "./pages/SignInPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";

import CustomerOrderPage from "./pages/finance/customer/customer-order-page/CustomerOrderPage";
import BackorderPage from "./pages/finance/customer/backorder-page/BackorderPage";
import BackorderListPage from "./pages/finance/customer/backorder-list-page/BackorderListPage";
import VendorOrderPage from "./pages/finance/vendor/vendor-order-page/VendorOrderPage";

import StockPage from "./pages/logistics/stock-page/StockPage";
import InboundPage from "./pages/logistics/inbound-page/InboundPage";
import OutboundPage from "./pages/logistics/outbound-page/OutboundPage";

import ProductPage from "./pages/configure/product-page/ProductPage";
import VendorPage from "./pages/configure/vendor-page/VendorPage";
import CustomerPage from "./pages/configure/customer-page/CustomerPage";
import VehiclePage from "./pages/configure/vehicle-page/VehiclePage";
import ResetPage from "./pages/test/ResetPage";


export default function App() {
  return (
    <>
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/" element={<Navigate replace to="/sign-in" />}></Route>
        <Route path="/home" element={<Navigate replace to="/sign-in" />}></Route>

        {/* Private routes */}
        <Route element={<PrivateOutlet />}>
          <Route path="/profile" element={<ProfilePage />}></Route>

          {/* Finance routes */}
          <Route element={<AdminOutlet />}>

            {/* Customer routes */}
            <Route path="/finance/customer-order" element={<CustomerOrderPage />}>
              <Route path=":code" element={<CustomerOrderPage />}></Route>
            </Route>
            <Route path="/finance/backorder" element={<BackorderPage />}>
              <Route path=":id" element={<BackorderPage />}></Route>
            </Route>
            <Route path="/finance/backorder-list" element={<BackorderListPage />}></Route>

            {/* Vendor routes */}
            <Route path="/finance/vendor-order" element={<VendorOrderPage />}>
              <Route path=":code" element={<VendorOrderPage />}></Route>
            </Route>
          </Route>

          {/* Logistics routes */}
          <Route path="/logistics/stock" element={<StockPage />}></Route>
          <Route path="/logistics/inbound" element={<InboundPage />}></Route>
          <Route path="/logistics/outbound" element={<OutboundPage />}></Route>

          {/* Configure routes */}
          <Route element={<AdminOutlet />}>
            <Route path="/configure/product" element={<ProductPage />}></Route>
            <Route path="/configure/customer" element={<CustomerPage />}></Route>
            <Route path="/configure/vendor" element={<VendorPage />}></Route>
            <Route path="/configure/vehicle" element={<VehiclePage />}></Route>
          </Route>

          {/* Test routes */}
          <Route element={<MasterOutlet />}>
            <Route path="/test/reset" element={<ResetPage />}></Route>
          </Route>
        </Route>
        
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </>
  )
}
