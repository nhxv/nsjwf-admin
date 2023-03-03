import { useState } from "react";
import { BiRevision, BiTrash } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { PaymentStatus } from "../../../../commons/enums/payment-status.enum";
import { convertTime } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import StatusTag from "../../../../components/StatusTag";
import api from "../../../../stores/api";

export default function CustomerSaleList({ search, reload, clear }) {
  const [formState, setFormState] = useState({
    loading: false,
    error: "",
  });

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
        setTimeout(() => {
          setFormState((prev) => ({ ...prev, error: "", loading: false }));
          reload();
        }, 2000);
      });
  };

  if (search.found.length > 0) {
    return (
      <>
        {search.found.map((sale) => {
          return (
            <div
              key={sale.code}
              className="custom-card mb-4 w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12"
            >
              {/* basic sale info */}
              <div className="flex flex-row justify-between">
                <div>
                  <p>#{sale.manualCode ? sale.manualCode : sale.code}</p>
                  <p className="text-xl font-semibold">{sale.customerName}</p>
                  <div>
                    <span className="text-sm text-neutral">
                      Completed at {convertTime(new Date(sale.updatedAt))}
                    </span>
                  </div>
                  <div className="mt-5">
                    <StatusTag status={sale.paymentStatus}></StatusTag>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-ghost btn-circle btn bg-base-200 text-neutral dark:bg-base-300 dark:text-neutral-content"
                  onClick={() =>
                    onUpdatePayment(PaymentStatus.RECEIVABLE, sale.code)
                  }
                >
                  <BiRevision className="h-6 w-6"></BiRevision>
                </button>
              </div>
              <div className="divider"></div>
              {/* products in sale */}
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
              {sale.productCustomerOrders.map((productOrder) => {
                return (
                  <div
                    key={productOrder.productName}
                    className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3 dark:bg-base-300"
                  >
                    <div className="ml-3 w-6/12">
                      <span>{productOrder.productName}</span>
                    </div>
                    <div className="w-3/12 text-center">
                      <span>
                        {productOrder.quantity} ({productOrder.unitCode})
                      </span>
                    </div>
                    <div className="w-3/12 text-center">
                      <span>${productOrder.unitPrice}</span>
                    </div>
                  </div>
                );
              })}
              <div className="divider"></div>
              <div className="grid grid-cols-12 gap-3">
                <button
                  className="btn-outline-primary btn col-span-6 w-full"
                  onClick={() =>
                    onUpdatePayment(PaymentStatus.CHECK, sale.code)
                  }
                >
                  Check
                </button>
                <button
                  className="btn-primary btn col-span-6 w-full"
                  onClick={() => onUpdatePayment(PaymentStatus.CASH, sale.code)}
                >
                  Cash
                </button>
              </div>
              {!sale.fullReturn && (
                <button
                  className="btn-accent btn mt-3 w-full"
                  onClick={() => onCreateReturn(sale.code)}
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
