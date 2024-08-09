import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { BiPlus, BiPrinter } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";
import { convertTimeToText } from "../../../../commons/utils/time.util";
import Alert, { AlertFromQueryError } from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import SearchInput from "../../../../components/forms/SearchInput";
import SelectInput from "../../../../components/forms/SelectInput";
import api from "../../../../stores/api";
import CustomerListPrint from "./CustomerListPrint";
import { useAuthStore } from "../../../../stores/auth.store";
import { Role } from "../../../../commons/enums/role.enum";

export default function CustomerOrderList() {
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const [search, setSearch] = useState({
    orders: [],
    query: "",
    boxCount: 0,
    status: "ALL",
  });
  const total = useMemo(() => {
    return niceVisualDecimal(
      search.orders.reduce(
        (prev, curr) =>
          prev +
          curr.productCustomerOrders.reduce(
            (prev, curr) => prev + curr.quantity * curr.unit_price,
            0
          ),
        0
      )
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

      // Count how many boxes that match with this query.
      let qtyTotal = 0;
      for (const order of filterByStatus(query.data, search.status)) {
        const matchedProducts = order.productCustomerOrders.filter((pOrder) => {
          return pOrder.product_name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(e.target.value.toLowerCase().replace(/\s+/g, ""));
        });
        for (const product of matchedProducts) {
          if (product.unit_code.endsWith("BOX")) {
            qtyTotal += product.quantity;
          }
        }
      }

      setSearch((prev) => ({
        ...prev,
        orders: searched,
        boxCount: qtyTotal,
        query: e.target.value,
      }));
    } else {
      setSearch((prev) => ({
        ...prev,
        orders: filterByStatus(query.data, prev.status),
        boxCount: 0,
        query: e.target.value,
      }));
    }
  };

  const onClearQuery = () => {
    setSearch((prev) => ({
      ...prev,
      orders: filterByStatus(query.data, prev.status),
      boxCount: 0,
      query: "",
    }));
  };

  if (query.status === "loading") {
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
    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <AlertFromQueryError queryError={query.error} />
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
        <CustomerListPrint printRef={printRef} orders={search.orders} />
      </div>

      {(role === Role.MASTER || role === Role.ADMIN) && (
        <div className="fixed bottom-24 right-6 z-20 md:right-8">
          <button
            type="button"
            className="btn btn-circle btn-primary"
            onClick={() => {
              navigate("/customer/draft-customer-order");
            }}
          >
            <span>
              <BiPlus className="h-8 w-8"></BiPlus>
            </span>
          </button>
        </div>
      )}

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
          {search.boxCount > 0 && (
            <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
              <span>{search.boxCount} boxes</span>
            </div>
          )}
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

            <label className="btn btn-square btn-accent">
              <BiPrinter className="h-6 w-6" onClick={handlePrint}></BiPrinter>
            </label>
          </div>
        </div>
      </div>
      <div className="mx-4 grid grid-cols-12 gap-2">
        {search.orders.map((order) => (
          <div
            key={order.code}
            className={`sticker col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2
            ${order.status === OrderStatus.PICKING ? "sticker-yellow" : ""}
            ${order.status === OrderStatus.CHECKING ? "sticker-sky" : ""}
            ${order.status === OrderStatus.SHIPPING ? "sticker-purple" : ""}
            ${order.status === OrderStatus.DELIVERED ? "sticker-primary" : ""}`}
            onClick={() => onToDetails(order.code)}
          >
            <div>#{order.manual_code ? order.manual_code : order.code}</div>
            <div className="font-semibold">{order.customer_name}</div>
            <div className="text-sm">
              {convertTimeToText(new Date(order.expected_at))}
            </div>
            <button
              className={`btn btn-sm mt-3 w-full
              ${
                order.status === OrderStatus.PICKING ? "btn-sticker-yellow" : ""
              }
              ${order.status === OrderStatus.CHECKING ? "btn-sticker-sky" : ""}
              ${
                order.status === OrderStatus.SHIPPING
                  ? "btn-sticker-purple"
                  : ""
              }
              ${
                order.status === OrderStatus.DELIVERED
                  ? "btn-sticker-primary"
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
