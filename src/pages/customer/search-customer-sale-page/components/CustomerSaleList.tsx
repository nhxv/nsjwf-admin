import { useState } from "react";
import { BiRevision, BiTrash } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { PaymentStatus } from "../../../../commons/enums/payment-status.enum";
import { Role } from "../../../../commons/enums/role.enum";
import { convertTimeToText } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import StatusTag from "../../../../components/StatusTag";
import api from "../../../../stores/api";
import { useAuthStore } from "../../../../stores/auth.store";
import { handleTokenExpire } from "../../../../commons/utils/token.util";

export default function CustomerSaleList({ search, reload, clear }) {
  const [formState, setFormState] = useState({
    loading: false,
    error: "",
  });
  const role = useAuthStore((state) => state.role);

  const navigate = useNavigate();

  const onCreateReturn = (code: string) => {
    navigate(`/customer/create-customer-return/${code}`);
  };

  const onClearAll = () => {
    clear();
  };

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

        if (error.status === 401) {
          handleTokenExpire(navigate, setFormState);
        } else {
          setTimeout(() => {
            setFormState((prev) => ({ ...prev, error: "", loading: false }));
            reload();
          }, 2000);
        }
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

        if (error.status === 401) {
          handleTokenExpire(navigate, setFormState);
        } else {
          setTimeout(() => {
            setFormState((prev) => ({ ...prev, error: "", loading: false }));
            reload();
          }, 2000);
        }
      });
  };

  if (search.found.length > 0) {
    return (
      <>
        {search.found.map((report) => {
          return (
            <div
              key={report.code}
              className="custom-card mb-4 w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12"
            >
              {/* basic report info */}
              <div className="flex flex-row justify-between">
                <div>
                  <p>
                    #{report.manualCode ? report.manualCode : report.orderCode}
                  </p>
                  <p className="text-xl font-semibold">{report.customerName}</p>
                  <p className="text-sm text-neutral">
                    Completed at {convertTimeToText(new Date(report.updatedAt))}
                  </p>
                  <div className="mt-5">
                    <StatusTag status={report.paymentStatus}></StatusTag>
                  </div>
                </div>
                {role === Role.MASTER && (
                  <button
                    // Without this flex, the icon will not be in center.
                    className="btn-ghost tooltip btn-circle btn flex bg-base-200 text-neutral dark:bg-base-300 dark:text-neutral-content"
                    onClick={() => onRevert(report.orderCode)}
                    data-tip="Revert this order"
                  >
                    <BiRevision className="h-6 w-6 bg-transparent text-error-content"></BiRevision>
                  </button>
                )}
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
                    key={productOrder.unitCode}
                    className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3 dark:bg-base-300"
                  >
                    <div className="ml-3 w-6/12">
                      <span>{productOrder.productName}</span>
                    </div>
                    <div className="w-3/12 text-center">
                      <span>
                        {productOrder.quantity}{" "}
                        {productOrder.unitCode === "box"
                          ? ``
                          : `(${productOrder.unitCode})`}
                      </span>
                    </div>
                    <div className="w-3/12 text-center">
                      <span>${productOrder.unitPrice}</span>
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
                    onUpdatePayment(PaymentStatus.CHECK, report.orderCode)
                  }
                >
                  Check
                </button>
                <button
                  className="btn-primary btn col-span-6 w-full"
                  onClick={() =>
                    onUpdatePayment(PaymentStatus.CASH, report.orderCode)
                  }
                >
                  Cash
                </button>
              </div>
              <button
                className="btn-accent btn mt-3 w-full"
                onClick={() =>
                  onUpdatePayment(PaymentStatus.RECEIVABLE, report.orderCode)
                }
              >
                Receivable
              </button>
              {!report.fullReturn && (
                <button
                  className="btn-accent btn mt-3 w-full"
                  onClick={() => onCreateReturn(report.orderCode)}
                >
                  Create return
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
        <div className="mt-4 mb-8">
          <button className="btn-accent btn" onClick={onClearAll}>
            <span className="mr-2">Clear search result(s)</span>
            <BiTrash className="h-6 w-6"></BiTrash>
          </button>
        </div>
      </>
    );
  }

  if (search.loading) {
    return <Spinner></Spinner>;
  }

  if (search.greet) {
    return <p className="text-neutral">{search.greet}</p>;
  }

  if (search.error) {
    return <p className="text-neutral">{search.error}</p>;
  }

  if (search.empty) {
    return <p className="text-neutral">{search.empty}</p>;
  }

  return null;
}
