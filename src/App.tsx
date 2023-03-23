import { Routes, Route, Navigate } from "react-router-dom";

import MasterOutlet from "./components/outlets/MasterOutlet";
import AdminOutlet from "./components/outlets/AdminOutlet";
import PrivateOutlet from "./components/outlets/PrivateOutlet";

import SignInPage from "./pages/SignInPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";

import DraftCustomerOrderPage from "./pages/customer/draft-customer-order-page/DraftCustomerOrderPage";
import ViewCustomerOrderPage from "./pages/customer/view-customer-order-page/ViewCustomerOrderPage";

import DraftVendorOrderPage from "./pages/vendor/draft-vendor-order-page/DraftVendorOrderPage";
import ViewVendorOrderPage from "./pages/vendor/view-vendor-order-page/ViewVendorOrderPage";

import ViewStockPage from "./pages/stock/view-stock-page/ViewStockPage";

import VehiclePage from "./pages/configure/vehicle-page/VehiclePage";
import ResetPage from "./pages/test/ResetPage";
import DraftStockPage from "./pages/stock/draft-stock-page/DraftStockPage";
import CreateCustomerReturnPage from "./pages/customer/create-customer-return-page/CreateCustomerReturnPage";
import SearchCustomerSalePage from "./pages/customer/search-customer-sale-page/SearchCustomerSalePage";
import ViewCustomerReturnPage from "./pages/customer/view-customer-return-page/ViewCustomerReturnPage";
import CreateVendorReturnPage from "./pages/vendor/create-vendor-return-page/CreateVendorReturnPage";
import SearchVendorSalePage from "./pages/vendor/search-vendor-sale-page/SearchVendorSalePage";
import ViewVendorReturnPage from "./pages/vendor/view-vendor-return-page/ViewVendorReturnPage";
import ReportCustomerSalePage from "./pages/customer/report-customer-sale-page/ReportCustomerSalePage";
import ViewTaskPage from "./pages/task/view-task-page/ViewTaskPage";
import ReportTaskPage from "./pages/task/report-task-page/ReportTaskPage";
import DraftVendorPage from "./pages/configure/draft-vendor-page/DraftVendorPage";
import ViewVendorPage from "./pages/configure/view-vendor-page/ViewVendorPage";
import DraftCustomerPage from "./pages/configure/draft-customer-page/DraftCustomerPage";
import ViewCustomerPage from "./pages/configure/view-customer-page/ViewCustomerPage";
import UpdateOrderPriorityPage from "./pages/customer/update-order-priority-page/UpdateOrderPriorityPage";
import OverviewCustomerOrderPage from "./pages/customer/overview-customer-order-page/OverviewCustomerOrderPage";
import EmployeePage from "./pages/configure/employee-page/EmployeePage";
import DraftProductPage from "./pages/configure/draft-product-page/DraftProductPage";
import ViewProductPage from "./pages/configure/view-product-page/ViewProductPage";
import CustomerOrderDetailPage from "./pages/customer/view-customer-order-detail-page/CustomerOrderDetailPage";

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
            path="/customer/create-customer-return/:code"
            element={<CreateCustomerReturnPage />}
          ></Route>
          <Route
            path="/customer/search-customer-sale"
            element={<SearchCustomerSalePage />}
          ></Route>
          <Route
            path="/customer/view-customer-return"
            element={<ViewCustomerReturnPage />}
          ></Route>
          <Route
            path="/customer/view-sale"
            element={<ReportCustomerSalePage />}
          ></Route>
          <Route
            path="/customer/view-customer-order"
            element={<ViewCustomerOrderPage />}
          ></Route>
          <Route
            path="/customer/view-customer-order-detail/:code"
            element={<CustomerOrderDetailPage />}
          ></Route>
          <Route
            path="/customer/overview-customer-order"
            element={<OverviewCustomerOrderPage />}
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
            path="/vendor/create-vendor-return/:code"
            element={<CreateVendorReturnPage />}
          ></Route>
          <Route
            path="/vendor/search-vendor-sale"
            element={<SearchVendorSalePage />}
          ></Route>
          <Route
            path="/vendor/view-vendor-return"
            element={<ViewVendorReturnPage />}
          ></Route>
          <Route
            path="/vendor/view-vendor-order"
            element={<ViewVendorOrderPage />}
          ></Route>
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
