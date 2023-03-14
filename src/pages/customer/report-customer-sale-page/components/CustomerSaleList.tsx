import { useState } from "react";
import { BiRevision } from "react-icons/bi";
import { PaymentStatus } from "../../../../commons/enums/payment-status.enum";
import { Role } from "../../../../commons/enums/role.enum";
import { convertTime } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import StatusTag from "../../../../components/StatusTag";
import api from "../../../../stores/api";
import { useAuthStore } from "../../../../stores/auth.store";

export default function CustomerSaleList({ reports, reload }) {
  const [formState, setFormState] = useState({
    loading: false,
    error: "",
  });
  const role = useAuthStore((state) => state.role);

  const onUpdatePayment = (status: string, code: string) => {
    setFormState((prev) => ({ ...prev, loading: true, error: "" }));
    const reqData = {
      status: status,
    };
    api
      .put(`/customer-payment/status/${code}`, reqData)
      .then((res) => {
        setFormState((prev) => ({ ...prev, loading: false, error: "" }));
        reload();
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFormState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
        setTimeout(() => {
          setFormState((prev) => ({ ...prev, error: "", loading: false }));
          reload();
        }, 2000);
      });
  };

  const onRevert = (code: string) => {
    api
      .put(`/customer-orders/revert/${code}`)
      .then((res) => {
        setFormState((prev) => ({ ...prev, loading: false, error: "" }));
        reload();
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFormState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
        setTimeout(() => {
          setFormState((prev) => ({ ...prev, error: "", loading: false }));
          reload();
        }, 2000);
      });
  };

  return (
    <>
      {reports.map((report) => {
        return (
          <div key={report.order_code} className="custom-card mb-8">
            {/* basic report info */}
            <div className="flex flex-row justify-between">
              <div>
                <p>
                  #{report.manual_code ? report.manual_code : report.order_code}
                </p>
                <p className="text-xl font-semibold">{report.customer_name}</p>
                <p className="text-sm text-neutral">
                  Completed at {convertTime(new Date(report.date))}
                </p>
                <div className="mt-5">
                  <StatusTag status={report.payment_status}></StatusTag>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost btn-circle btn bg-base-200 text-neutral dark:bg-base-300 dark:text-neutral-content"
                onClick={() =>
                  onUpdatePayment(PaymentStatus.RECEIVABLE, report.order_code)
                }
              >
                <BiRevision className="h-6 w-6"></BiRevision>
              </button>
            </div>
            <div className="divider"></div>
            {/* products in report */}
            <div className="mb-2 flex items-center">
              <div className="w-6/12">
                <span className="font-medium">Product</span>
              </div>
              <div className="w-3/12 text-center">
                <span className="font-medium">Qty</span>
              </div>
              <div className="w-3/12 text-center">
                <span className="font-medium">Price</span>
              </div>
            </div>
            {report.productCustomerOrders.map((productOrder) => {
              return (
                <div
                  key={productOrder.product_name}
                  className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3 dark:bg-base-300"
                >
                  <div className="ml-3 w-6/12">
                    <span>{productOrder.product_name}</span>
                  </div>
                  <div className="w-3/12 text-center">
                    <span>
                      {productOrder.quantity} (
                      {productOrder.unit_code.split("_")[1].toLowerCase()})
                    </span>
                  </div>
                  <div className="w-3/12 text-center">
                    <span>${productOrder.unit_price}</span>
                  </div>
                </div>
              );
            })}
            <div className="divider"></div>
            <div className="mt-2 flex items-center">
              <span className="mr-2">Total:</span>
              <span className="mr-2 text-xl font-medium">${report.sale}</span>
              <span className="text-red-600">-${report.refund}</span>
            </div>
            <div className="mt-5 grid grid-cols-12 gap-3">
              <button
                type="button"
                className="btn-outline-primary btn col-span-6 w-full"
                onClick={() =>
                  onUpdatePayment(PaymentStatus.CHECK, report.order_code)
                }
              >
                Check
              </button>
              <button
                type="button"
                className="btn-primary btn col-span-6 w-full"
                onClick={() =>
                  onUpdatePayment(PaymentStatus.CASH, report.order_code)
                }
              >
                Cash
              </button>
            </div>
            {role === Role.MASTER && (
              <button
                type="button"
                className="btn-accent btn mt-3 w-full"
                onClick={() => onRevert(report.order_code)}
              >
                Revert
              </button>
            )}
            <div>
              {formState.loading && (
                <div className="mt-5">
                  <Spinner></Spinner>
                </div>
              )}
              {formState.error && (
                <div className="mt-5">
                  <Alert message={formState.error} type="error"></Alert>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
