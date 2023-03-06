import { useEffect, useState } from "react";
import { BiSortDown } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { OrderStatus } from "../../../commons/enums/order-status.enum";
import Alert from "../../../components/Alert";
import api from "../../../stores/api";

export default function OverviewCustomerOrderPage() {
  const [fetchData, setFetchData] = useState({
    orders: [],
    error: "",
    empty: "",
    loading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/customer-orders/daily`)
      .then((res) => {
        if (res.data.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            empty: "Such hollow, much empty...",
            loading: false,
          }));
        } else {
          setFetchData((prev) => ({
            ...prev,
            orders: res.data,
            error: "",
            empty: "",
            loading: false,
          }));
        }
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFetchData((prev) => ({
          ...prev,
          orders: [],
          error: error.message,
          empty: "",
          loading: false,
        }));
      });
  }, []);

  const onSwitchView = () => {
    navigate(`/customer/view-customer-order`);
  };

  return (
    <section className="min-h-screen">
      <h1 className="mt-4 text-center text-xl font-bold">Overview</h1>
      {fetchData.empty && (
        <div className="my-8 flex justify-center">
          <div className="w-11/12 sm:w-8/12 lg:w-6/12 xl:w-5/12">
            <Alert message="Such hollow, much empty..." type="empty"></Alert>
          </div>
        </div>
      )}

      <div className="fixed bottom-24 right-6 z-20 md:right-8">
        <button
          className="btn-primary btn-circle btn shadow-md"
          onClick={onSwitchView}
        >
          <span>
            <BiSortDown className="h-6 w-6"></BiSortDown>
          </span>
        </button>
      </div>

      <div className="mt-8 grid grid-cols-12 gap-2 px-4">
        {fetchData.orders.map((order) => (
          <div
            key={order.code}
            className={`rounded-box col-span-12 border-2 p-3 shadow-md sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2
      ${
        order.status === OrderStatus.PICKING
          ? "border-yellow-700 bg-yellow-100 text-yellow-700 dark:bg-base-100 dark:shadow-yellow-700"
          : ""
      }
      ${
        order.status === OrderStatus.CHECKING
          ? "border-secondary bg-base-100 dark:shadow-secondary"
          : ""
      }
      ${
        order.status === OrderStatus.SHIPPING
          ? "border-purple-700 bg-purple-100 text-purple-700 dark:bg-base-100 dark:shadow-purple-700"
          : ""
      }
      ${
        order.status === OrderStatus.DELIVERED
          ? "border-sky-700 bg-sky-100 text-sky-700 dark:bg-base-100 dark:shadow-sky-700"
          : ""
      }
      ${
        order.status === OrderStatus.COMPLETED
          ? "border-emerald-700 bg-emerald-100 text-emerald-700 dark:bg-base-100 dark:shadow-emerald-700"
          : ""
      }`}
          >
            <div>#{order.manual_code ? order.manual_code : order.code}</div>
            <div className="font-semibold">{order.customer_name}</div>
            <div className="text-sm">
              {order.status.toLowerCase()} by{" "}
              {order.status === OrderStatus.CHECKING ||
              order.status === OrderStatus.COMPLETED
                ? "Admin"
                : order.assign_to}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
