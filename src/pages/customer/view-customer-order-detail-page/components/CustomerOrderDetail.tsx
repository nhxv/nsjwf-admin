import { useNavigate, useParams } from "react-router-dom";
import { convertTimeToText } from "../../../../commons/utils/time.util";
import Spinner from "../../../../components/Spinner";
import StatusTag from "../../../../components/StatusTag";
import api from "../../../../stores/api";
import CustomerOrderPrint from "./CustomerOrderPrint";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import { useQuery } from "@tanstack/react-query";
import Alert, { AlertFromQueryError } from "../../../../components/Alert";
import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";
import { Disclosure } from "@headlessui/react";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { Fragment } from "react";

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
    return <AlertFromQueryError queryError={orderQuery.error} />;
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
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button
              className="divider w-full py-6 hover:text-primary hover:before:bg-primary hover:after:bg-primary"
              onClick={(e) => e.stopPropagation()}
            >
              {open ? (
                <>
                  Hide
                  <span className="scale-150">
                    <BiChevronUp></BiChevronUp>
                  </span>
                </>
              ) : (
                <>
                  View {order.productCustomerOrders.length} Product
                  {order.productCustomerOrders.length > 1 ? "s" : ""}
                  <span className="scale-150">
                    <BiChevronDown></BiChevronDown>
                  </span>
                </>
              )}
            </Disclosure.Button>
            <Disclosure.Panel as={Fragment}>
              <Disclosure.Button as="div" onClick={(e) => e.stopPropagation()}>
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

                {/* products in order */}
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
                          {productOrder.unit_code
                            .split("_")[1]
                            .toLowerCase() === "box"
                            ? ``
                            : `(${productOrder.unit_code
                                .split("_")[1]
                                .toLowerCase()})`}
                        </span>
                      </div>
                      <div className="w-3/12 text-center">
                        {niceVisualDecimal(productOrder.unit_price)}
                      </div>
                    </div>
                  );
                })}

                <div className="divider"></div>
              </Disclosure.Button>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <div className="mt-2 flex items-center">
        <span className="mr-2">Total:</span>
        <span className="text-xl font-medium">
          $
          {niceVisualDecimal(
            order.productCustomerOrders.reduce(
              (prev, curr) => prev + curr.quantity * curr.unit_price,
              0
            )
          )}
        </span>
      </div>
      <button
        className="btn btn-primary mt-5 w-full"
        onClick={() => onUpdateOrder(order.code)}
      >
        Update order
      </button>
    </div>
  );
}
