import { Navigate, Route, Routes } from "react-router-dom";

import AdminOutlet from "./components/outlets/AdminOutlet";
import MasterOutlet from "./components/outlets/MasterOutlet";
import PrivateOutlet from "./components/outlets/PrivateOutlet";

import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import SignInPage from "./pages/SignInPage";

import DraftCustomerOrderPage from "./pages/customer/draft-customer-order-page/DraftCustomerOrderPage";
import ViewCustomerOrderPage from "./pages/customer/view-customer-order-page/ViewCustomerOrderPage";

import DraftVendorOrderPage from "./pages/vendor/draft-vendor-order-page/DraftVendorOrderPage";
import VendorOrderDetailPage from "./pages/vendor/view-vendor-order-detail-page/VendorOrderDetailPage";
import ViewVendorOrderPage from "./pages/vendor/view-vendor-order-page/ViewVendorOrderPage";

import ViewStockPage from "./pages/stock/view-stock-page/ViewStockPage";

import DraftCustomerPage from "./pages/configure/draft-customer-page/DraftCustomerPage";
import DraftProductPage from "./pages/configure/draft-product-page/DraftProductPage";
import DraftVendorPage from "./pages/configure/draft-vendor-page/DraftVendorPage";
import EmployeePage from "./pages/configure/employee-page/EmployeePage";
import ViewCustomerPage from "./pages/configure/view-customer-page/ViewCustomerPage";
import ViewProductPage from "./pages/configure/view-product-page/ViewProductPage";
import ViewVendorPage from "./pages/configure/view-vendor-page/ViewVendorPage";
import FindCustomerSalePage from "./pages/customer/find-customer-sale-page/FindCustomerSalePage";
import UpdateOrderPriorityPage from "./pages/customer/update-order-priority-page/UpdateOrderPriorityPage";
import CustomerOrderDetailPage from "./pages/customer/view-customer-order-detail-page/CustomerOrderDetailPage";
import DraftStockPage from "./pages/stock/draft-stock-page/DraftStockPage";
import ReportTaskPage from "./pages/task/report-task-page/ReportTaskPage";
import ViewTaskPage from "./pages/task/view-task-page/ViewTaskPage";
import ResetPage from "./pages/test/ResetPage";
import FindVendorSalePage from "./pages/vendor/find-vendor-sale-page/FindVendorSalePage";
import AnalyzeCustomerSalePage from "./pages/analysis/analyze-customer-sale-page/AnalyzeCustomerSalePage";
import AnalyzeProductSalePage from "./pages/analysis/analyze-product-sale-page/AnalyzeProductSalePage";

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/" element={<Navigate replace to="/sign-in" />}></Route>
      <Route path="/home" element={<Navigate replace to="/sign-in" />}></Route>

      {/* Private routes */}
      <Route element={<PrivateOutlet />}>
        <Route path="/profile" element={<ProfilePage />}></Route>

        {/* Customer routes */}
        <Route element={<AdminOutlet />}>
          <Route
            path="/customer/draft-customer-order"
            element={<DraftCustomerOrderPage />}
          >
            <Route path=":code" element={<DraftCustomerOrderPage />}></Route>
          </Route>
          <Route
            path="/customer/update-order-priority"
            element={<UpdateOrderPriorityPage />}
          ></Route>
          <Route
            path="/customer/find-sale"
            element={<FindCustomerSalePage />}
          ></Route>
          <Route
            path="/customer/view-customer-order"
            element={<ViewCustomerOrderPage />}
          ></Route>
          <Route
            path="/customer/view-customer-order-detail/:code"
            element={<CustomerOrderDetailPage />}
          ></Route>
        </Route>

        {/* Vendor routes */}
        <Route element={<AdminOutlet />}>
          <Route
            path="/vendor/draft-vendor-order"
            element={<DraftVendorOrderPage />}
          >
            <Route path=":code" element={<DraftVendorOrderPage />}></Route>
          </Route>
          <Route
            path="/vendor/find-purchase"
            element={<FindVendorSalePage />}
          ></Route>
          <Route
            path="/vendor/view-vendor-order"
            element={<ViewVendorOrderPage />}
          ></Route>
          <Route
            path="/vendor/view-vendor-order-detail/:code"
            element={<VendorOrderDetailPage />}
          ></Route>
        </Route>

        {/* Analysis routes */}
        <Route element={<AdminOutlet />}>
          <Route path="/analysis/analyze-customer-sale" element={<AnalyzeCustomerSalePage />}></Route>
          <Route path="/analysis/analyze-product-sale" element={<AnalyzeProductSalePage />}></Route>
        </Route>

        {/* Stock routes */}
        <Route element={<AdminOutlet />}>
          <Route
            path="/stock/change-stock"
            element={<DraftStockPage />}
          ></Route>
        </Route>
        <Route path="/stock/view-stock" element={<ViewStockPage />}></Route>

        {/* Task routes */}
        <Route path="/task/view-task" element={<ViewTaskPage />}></Route>
        <Route path="/task/report-task" element={<ReportTaskPage />}></Route>

        {/* Configure routes */}
        <Route element={<AdminOutlet />}>
          {/* <Route path="/configure/product" element={<ProductPage />}></Route> */}
          <Route path="/configure/draft-product" element={<DraftProductPage />}>
            <Route path=":id" element={<DraftProductPage />}></Route>
          </Route>
          <Route
            path="/configure/view-product"
            element={<ViewProductPage />}
          ></Route>
          <Route
            path="/configure/draft-customer"
            element={<DraftCustomerPage />}
          >
            <Route path=":id" element={<DraftCustomerPage />}></Route>
          </Route>
          <Route
            path="/configure/view-customer"
            element={<ViewCustomerPage />}
          ></Route>
          <Route path="/configure/draft-vendor" element={<DraftVendorPage />}>
            <Route path=":id" element={<DraftVendorPage />}></Route>
          </Route>
          <Route
            path="/configure/view-vendor"
            element={<ViewVendorPage />}
          ></Route>
          {/* <Route path="/configure/vehicle" element={<VehiclePage />}></Route> */}
          <Route path="/configure/employee" element={<EmployeePage />}></Route>
        </Route>

        {/* Test routes */}
        <Route element={<MasterOutlet />}>
          <Route path="/test/reset" element={<ResetPage />}></Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />}></Route>
    </Routes>
  );
}
