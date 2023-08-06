import { useNavigate, useParams } from "react-router-dom";
import { convertTimeToText } from "../../../../commons/utils/time.util";
import Spinner from "../../../../components/Spinner";
import StatusTag from "../../../../components/StatusTag";
import api from "../../../../stores/api";
import CustomerOrderPrint from "./CustomerOrderPrint";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import { useQuery } from "@tanstack/react-query";
import Alert from "../../../../components/Alert";

export default function CustomerOrderDetail() {
  const params = useParams();
  const navigate = useNavigate();

  const orderQuery = useQuery<any, any>({
    queryKey: ["customer-orders", `${params.code}`],
    queryFn: async ({ queryKey }) => {
      const [_, code] = queryKey;

      // NOTE: Might need a check to see if code is truthy here.
      const result = await api.get(`/customer-orders/${code}`);
      return result.data;
    },
  });

  const onUpdateOrder = (code: string) => {
    navigate(`/customer/draft-customer-order/${code}`);
  };

  if (
    orderQuery.status === "loading" ||
    orderQuery.fetchStatus === "fetching"
  ) {
    return <Spinner></Spinner>;
  }

  if (
    orderQuery.fetchStatus === "paused" ||
    (orderQuery.status === "error" && orderQuery.fetchStatus === "idle")
  ) {
    let error = JSON.parse(
      JSON.stringify(
        orderQuery.error.response
          ? orderQuery.error.response.data.error
          : orderQuery.error
      )
    );
    if (error.status === 401) {
      // This is just cursed.
      handleTokenExpire(
        navigate,
        (err) => {
          error = err;
        },
        (msg) => ({ ...error, message: msg })
      );
    }

    return <Alert type="error" message={error.message}></Alert>;
  }

  const order = orderQuery.data;

  return (
    <div className="custom-card" onClick={() => onUpdateOrder(order.code)}>
      {/* basic order info */}
      <div className="flex justify-between">
        <div>
          <span className="block">
            #{order.manual_code ? order.manual_code : order.code}
          </span>
          <span className="block text-xl font-semibold">
            {order.customer_name}
          </span>
          <span className="block text-sm text-neutral">
            {convertTimeToText(new Date(order.expected_at))}
          </span>
          <div className="mb-6">
            <span className="text-sm text-neutral">by {order.assign_to}</span>
          </div>
          <div className={order.note ? "mb-6" : "mb-2"}>
            <StatusTag status={order.status}></StatusTag>
          </div>
          <div>{order.note}</div>
        </div>
        <CustomerOrderPrint order={order} />
      </div>
      <div className="divider"></div>
      {/* products in order */}
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
      <div className="max-h-48 overflow-auto lg:max-h-72 xl:max-h-72">
        {order.productCustomerOrders.map((productOrder) => {
          return (
            <div
              key={productOrder.unit_code}
              className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3 dark:bg-base-300"
            >
              <div className="ml-3 w-6/12">
                <span>{productOrder.product_name}</span>
              </div>
              <div className="w-3/12 text-center">
                <span>
                  {productOrder.quantity}{" "}
                  {productOrder.unit_code.split("_")[1].toLowerCase() === "box"
                    ? ``
                    : `(${productOrder.unit_code.split("_")[1].toLowerCase()})`}
                </span>
              </div>
              <div className="w-3/12 text-center">
                {productOrder.unit_price}
              </div>
            </div>
          );
        })}
      </div>
      <div className="divider"></div>
      <div className="mt-2 flex items-center">
        <span className="mr-2">Total:</span>
        <span className="text-xl font-medium">
          $
          {order.productCustomerOrders.reduce(
            (prev, curr) => prev + curr.quantity * curr.unit_price,
            0
          )}
        </span>
      </div>
      <button
        className="btn-primary btn mt-5 w-full"
        onClick={() => onUpdateOrder(order.code)}
      >
        Update order
      </button>
    </div>
  );
}
