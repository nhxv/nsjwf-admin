import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { convertTimeToText } from "../../../../commons/utils/time.util";
import Spinner from "../../../../components/Spinner";
import StatusTag from "../../../../components/StatusTag";
import api from "../../../../stores/api";
import CustomerOrderPrint from "./CustomerOrderPrint";

export default function CustomerOrderDetail() {
  const [fetchData, setFetchData] = useState({
    order: null,
    loading: true,
    error: "",
  });
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (params.code) {
      api
        .get(`/customer-orders/${params.code}`)
        .then((res) => {
          setFetchData((prev) => ({
            ...prev,
            order: res.data,
            loading: false,
            error: "",
          }));
        })
        .catch((e) => {
          const error = JSON.parse(
            JSON.stringify(e.response ? e.response.data.error : e)
          );
          setFetchData((prev) => ({
            ...prev,
            order: null,
            loading: false,
            error: error.message,
          }));
        });
    }
  }, []);

  const onUpdateOrder = (code: string) => {
    navigate(`/customer/draft-customer-order/${code}`);
  };

  if (fetchData.loading) {
    return <Spinner></Spinner>;
  }

  return (
    <div className="custom-card">
      {/* basic order info */}
      <div className="flex justify-between">
        <div>
          <span className="block">
            #
            {fetchData.order.manual_code
              ? fetchData.order.manual_code
              : fetchData.order.code}
          </span>
          <span className="block text-xl font-semibold">
            {fetchData.order.customer_name}
          </span>
          <span className="block text-sm text-neutral">
            {convertTimeToText(new Date(fetchData.order.expected_at))}
          </span>
          <div className="mb-6">
            <span className="text-sm text-neutral">
              by {fetchData.order.assign_to}
            </span>
          </div>
          <div className="mb-2">
            <StatusTag status={fetchData.order.status}></StatusTag>
          </div>
        </div>
        <CustomerOrderPrint order={fetchData.order} />
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
      {fetchData.order.productCustomerOrders.map((productOrder) => {
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
            <div className="w-3/12 text-center">{productOrder.unit_price}</div>
          </div>
        );
      })}
      <div className="divider"></div>
      <div className="mt-2 flex items-center">
        <span className="mr-2">Total:</span>
        <span className="text-xl font-medium">
          $
          {fetchData.order.productCustomerOrders.reduce(
            (prev, curr) => prev + curr.quantity * curr.unit_price,
            0
          )}
        </span>
      </div>
      <button
        className="btn-primary btn mt-5 w-full"
        onClick={() => onUpdateOrder(fetchData.order.code)}
      >
        Update order
      </button>
    </div>
  );
}
