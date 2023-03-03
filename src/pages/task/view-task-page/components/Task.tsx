import { useEffect, useState } from "react";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import { convertTime } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import StatusTag from "../../../../components/StatusTag";
import api from "../../../../stores/api";
import { useAuthStore } from "../../../../stores/auth.store";

export default function Task({ order, reload, status }) {
  const [formState, setFormState] = useState({
    error: "",
    loading: false,
  });
  const nickname = useAuthStore((state) => JSON.parse(state.nickname));

  useEffect(() => {
    // cleanup when destroy
    return () => {
      setFormState((prev) => ({ ...prev, error: "", loading: false }));
    };
  }, []);

  const onFinishTask = async (code: string) => {
    setFormState((prev) => ({ ...prev, error: "", loading: true }));
    try {
      const res = await api.put(`/customer-orders/tasks/finish/${code}`);
      if (res) {
        setFormState((prev) => ({ ...prev, error: "", loading: false }));
        reload();
      }
    } catch (e) {
      const error = JSON.parse(
        JSON.stringify(e.response ? e.response.data.error : e)
      );
      setFormState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
    }
  };

  const onStartTask = async (code: string) => {
    setFormState((prev) => ({ ...prev, error: "", loading: true }));
    try {
      const res = await api.put(
        `/customer-orders/tasks/start-doing?code=${code}&nickname=${nickname}`
      );
      if (res) {
        setFormState((prev) => ({ ...prev, error: "", loading: false }));
        reload();
      }
    } catch (e) {
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
    }
  };

  const onStopTask = async (code: string) => {
    setFormState((prev) => ({ ...prev, error: "", loading: true }));
    try {
      const res = await api.put(`/customer-orders/tasks/stop-doing/${code}`);
      if (res) {
        setFormState((prev) => ({ ...prev, error: "", loading: false }));
        reload();
      }
    } catch (e) {
      const error = JSON.parse(
        JSON.stringify(e.response ? e.response.data.error : e)
      );
      setFormState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
    }
  };

  return (
    <div key={order.code} className="custom-card mb-8">
      {/* basic order info */}
      <div className="flex flex-row justify-between">
        <div>
          <div>
            <span>#{order.manualCode ? order.manualCode : order.code}</span>
          </div>
          <div>
            <span className="text-xl font-semibold">{order.customerName}</span>
          </div>
          {status === OrderStatus.CHECKING ||
          status === OrderStatus.DELIVERED ? (
            <>
              <div>
                <span className="text-sm text-neutral">
                  Expected at {convertTime(new Date(order.expectedAt))}
                </span>
              </div>
              <div className="mb-6">
                <span className="text-sm text-neutral">
                  by {order.assignTo}
                </span>
              </div>
            </>
          ) : (
            <div className="mb-6">
              <span className="text-sm text-neutral">
                Expected at {convertTime(new Date(order.expectedAt))}
              </span>
            </div>
          )}
          <div className="mb-2">
            <StatusTag status={order.status}></StatusTag>
          </div>
        </div>
      </div>
      <div className="divider"></div>
      {/* products in order */}
      <div className="mb-2 flex items-center">
        <div className="w-9/12">
          <span className="font-medium">Product</span>
        </div>
        <div className="w-3/12 text-center">
          <span className="font-medium">Qty</span>
        </div>
      </div>
      {order.productCustomerOrders.map((productOrder) => {
        return (
          <div
            key={productOrder.productName}
            className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3 dark:bg-base-300"
          >
            <div className="ml-3 w-9/12">
              <span>{productOrder.productName}</span>
            </div>
            <div className="w-3/12 text-center">
              <span>
                {productOrder.quantity} ({productOrder.unitCode})
              </span>
            </div>
          </div>
        );
      })}
      {status === OrderStatus.PICKING ||
        (status === OrderStatus.SHIPPING && (
          <>
            <div className="divider"></div>
            {order.isDoing ? (
              <>
                <button
                  className="btn-primary btn w-full"
                  onClick={() => onFinishTask(order.code)}
                  disabled={formState.loading}
                >
                  Done {order.status.toLowerCase()}
                </button>
                <button
                  className="btn-outline-primary btn mt-3 w-full"
                  onClick={() => onStopTask(order.code)}
                  disabled={formState.loading}
                >
                  Stop doing
                </button>
              </>
            ) : (
              <button
                className="btn-primary btn w-full"
                onClick={() => onStartTask(order.code)}
                disabled={formState.loading}
              >
                Start doing
              </button>
            )}
          </>
        ))}
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
}
