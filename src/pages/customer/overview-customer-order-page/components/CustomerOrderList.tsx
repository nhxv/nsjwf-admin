import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import { convertTimeToText } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import SearchInput from "../../../../components/forms/SearchInput";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import SelectInput from "../../../../components/forms/SelectInput";
import { useReactToPrint } from "react-to-print";
import { BiPrinter } from "react-icons/bi";
import ComponentToPrint from "./ComponentToPrint";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function CustomerOrderList() {
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    orders: [],
    query: "",
    status: "ALL",
  });
  const total = useMemo(() => {
    return search.orders.reduce(
      (prev, curr) =>
        prev +
        curr.productCustomerOrders.reduce(
          (prev, curr) => prev + curr.quantity * curr.unit_price,
          0
        ),
      0
    );
  }, [search.orders]);

  const query = useQuery<any[], any>({
    queryKey: ["customer-orders", "daily"],
    queryFn: async () => {
      const res = await api.get("/customer-orders/daily");
      // NOTE: This is probably not the best way to handle transformation.
      setSearch((prev) => ({
        ...prev,
        orders: filterByStatus(res.data, prev.status),
      }));
      return res.data;
    },
    refetchInterval: 60000,
  });

  // Cursed. Have to attach this pretty much on every search.orders
  const filterByStatus = (orders, status) => {
    return orders.filter((order) =>
      status === "ALL" ? true : order.status === status
    );
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const onToDetails = (code: string) => {
    navigate(`/customer/view-customer-order-detail/${code}`);
  };

  const onChangeQuery = (e) => {
    if (e.target.value) {
      // Search based on customer name and product name.
      const searched = filterByStatus(query.data, search.status).filter(
        (order) => {
          return (
            order.customer_name
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(e.target.value.toLowerCase().replace(/\s+/g, "")) ||
            order.productCustomerOrders.filter((pOrder) => {
              return pOrder.product_name
                .toLowerCase()
                .replace(/\s+/g, "")
                .includes(e.target.value.toLowerCase().replace(/\s+/g, ""));
            }).length !== 0
          );
        }
      );
      setSearch((prev) => ({
        ...prev,
        orders: searched,
        query: e.target.value,
      }));
    } else {
      setSearch((prev) => ({
        ...prev,
        orders: filterByStatus(query.data, prev.status),
        query: e.target.value,
      }));
    }
  };

  const onClearQuery = () => {
    setSearch((prev) => ({
      ...prev,
      orders: filterByStatus(query.data, prev.status),
      query: "",
    }));
  };

  if (query.status === "loading" || query.fetchStatus === "fetching") {
    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <Spinner></Spinner>
      </div>
    );
  }

  if (
    query.fetchStatus === "paused" ||
    (query.status === "error" && query.fetchStatus === "idle")
  ) {
    let error = JSON.parse(
      JSON.stringify(
        query.error.response ? query.error.response.data.error : query.error
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

    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <Alert type="error" message={error.message}></Alert>
      </div>
    );
  }

  if (query.data?.length === 0) {
    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <Alert type="empty" message={"Such empty, much hollow..."}></Alert>
      </div>
    );
  }

  return (
    <>
      <div className="hidden">
        {/* Not sure why it has to be a component here for it to print. */}
        <ComponentToPrint printRef={printRef} orders={search.orders} />
      </div>

      <div className="m-4 flex flex-col items-center justify-between gap-3 xl:flex-row">
        <div className="flex items-center gap-2">
          <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
            <span>
              {search.orders.length}{" "}
              {search.orders.length > 1 ? "orders" : "order"}
            </span>
          </div>
          <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
            <span>${total} in total</span>
          </div>
        </div>
        <div className="flex w-full flex-col-reverse gap-2 md:flex-row xl:w-5/12 xl:flex-row">
          <div className="md:w-4/12 xl:w-5/12">
            <SelectInput
              name="status-filter"
              value={search.status}
              setValue={(v) => {
                setSearch((prev) => ({
                  ...prev,
                  status: v,
                  orders: filterByStatus(query.data, v),
                }));
              }}
              options={["ALL"].concat(
                Object.values(OrderStatus).filter(
                  (s) => s != OrderStatus.CANCELED && s != OrderStatus.COMPLETED
                )
              )}
            />
          </div>

          <div className="flex w-full flex-row gap-2">
            <SearchInput
              id="order-search"
              name="order-search"
              placeholder="Search orders"
              value={search.query}
              onChange={(e) => onChangeQuery(e)}
              onClear={onClearQuery}
              onFocus={null}
            ></SearchInput>

            <label className="btn-accent btn-square btn">
              <BiPrinter className="h-6 w-6" onClick={handlePrint}></BiPrinter>
            </label>
          </div>
        </div>
      </div>
      <div className="mx-4 grid grid-cols-12 gap-2">
        {search.orders.map((order) => (
          <div
            key={order.code}
            className={`rounded-box col-span-12 border-2 p-3 shadow-md hover:cursor-pointer sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2
            ${
              order.status === OrderStatus.PICKING
                ? "border-yellow-700 bg-yellow-100 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900 dark:bg-opacity-10"
                : ""
            }
            ${
              order.status === OrderStatus.CHECKING
                ? "border-sky-700 bg-sky-100 text-sky-700 dark:border-sky-700 dark:bg-sky-900 dark:bg-opacity-10"
                : ""
            }
            ${
              order.status === OrderStatus.SHIPPING
                ? "border-purple-700 bg-purple-100 text-purple-700 dark:border-purple-700 dark:bg-purple-900 dark:bg-opacity-10"
                : ""
            }
            ${
              order.status === OrderStatus.DELIVERED
                ? "border-primary bg-emerald-100 text-primary dark:border-primary dark:bg-emerald-900 dark:bg-opacity-10"
                : ""
            }`}
            onClick={() => onToDetails(order.code)}
          >
            <div>#{order.manual_code ? order.manual_code : order.code}</div>
            <div className="font-semibold">{order.customer_name}</div>
            <div className="text-sm">
              {convertTimeToText(new Date(order.expected_at))}
            </div>
            <button
              className={`btn-sm btn mt-3 w-full
            ${
              order.status === OrderStatus.PICKING
                ? "border-yellow-700 bg-transparent text-yellow-700 hover:border-yellow-700 hover:bg-yellow-700 hover:text-white"
                : ""
            }
            ${
              order.status === OrderStatus.CHECKING
                ? "border-sky-700 bg-transparent text-sky-700 hover:border-sky-700 hover:bg-sky-700 hover:text-white"
                : ""
            }
            ${
              order.status === OrderStatus.SHIPPING
                ? "border-purple-700 bg-transparent text-purple-700 hover:border-purple-700 hover:bg-purple-700 hover:text-white"
                : ""
            }
            ${
              order.status === OrderStatus.DELIVERED
                ? "border-primary bg-transparent text-primary hover:border-primary hover:bg-primary hover:text-white"
                : ""
            }`}
              onClick={() => onToDetails(order.code)}
            >
              Details
            </button>
          </div>
        ))}
      </div>
      {search.orders?.length < 1 && (
        <div className="text-center">Not found.</div>
      )}
    </>
  );
}
