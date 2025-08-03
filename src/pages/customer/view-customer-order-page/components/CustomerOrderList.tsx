import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { BiPrinter } from "react-icons/bi";
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

interface IOrderStatusMutation {
  code: string;
  newStatus: string;
}

export default function CustomerOrderList() {
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    query: "",
    status: "ALL",
  });
  const [showTotal, setShowTotal] = useState(false);

  const dailyOrderQuery = useQuery<any[], any>({
    queryKey: ["customer-orders", "daily"],
    queryFn: async () => {
      const res = await api.get("/customer-orders/daily");
      return res.data;
    },
    refetchInterval: 60000,
  });

  const filterByStatus = (orders, status: string) => {
    if (status === "ALL") {
      return orders;
    }

    return orders.filter((order) => order.status === status);
  };

  const filteredOrders = dailyOrderQuery.data
    ? search.query === ""
      ? filterByStatus(dailyOrderQuery.data, search.status)
      : filterByStatus(dailyOrderQuery.data, search.status).filter((order) => {
          return (
            order.customer_name
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(search.query.toLowerCase().replace(/\s+/g, "")) ||
            order.productCustomerOrders.filter((pOrder) => {
              return pOrder.product_name
                .toLowerCase()
                .replace(/\s+/g, "")
                .includes(search.query.toLowerCase().replace(/\s+/g, ""));
            }).length !== 0
          );
        })
    : [];

  const total = useMemo(() => {
    return niceVisualDecimal(
      filteredOrders.reduce(
        (prev, curr) =>
          prev +
          curr.productCustomerOrders.reduce(
            (prev, curr) => prev + curr.quantity * curr.unit_price,
            0
          ),
        0
      )
    );
  }, [filteredOrders]);

  // const boxCount = useMemo(() => {
  //   let qtyTotal = 0;
  //   for (const order of filteredOrders) {
  //     const matchedProducts = order.productCustomerOrders.filter((pOrder) => {
  //       return pOrder.product_name
  //         .toLowerCase()
  //         .replace(/\s+/g, "")
  //         .includes(search.query.toLowerCase().replace(/\s+/g, ""));
  //     });
  //     for (const product of matchedProducts) {
  //       if (product.unit_code.endsWith("BOX")) {
  //         qtyTotal += product.quantity;
  //       }
  //     }
  //   }
  //   return qtyTotal;
  // }, [filteredOrders]);

  // This mutation is a modified one from CustomerOrderPrint.
  const queryClient = useQueryClient();
  const orderStatusMut = useMutation({
    mutationFn: (data: IOrderStatusMutation) => {
      return api.patch("customer-orders/status", null, {
        params: {
          code: data.code,
          status: data.newStatus,
        },
      });
    },
    onSuccess: (response, variables, _ctx) => {
      const newCustomerOrder = response.data;
      queryClient.setQueryData(
        ["customer-orders", variables.code],
        newCustomerOrder
      );
      return queryClient.invalidateQueries({
        queryKey: ["customer-orders", "daily"],
      });
    },
    onError: () => {
      return queryClient.invalidateQueries({
        queryKey: ["customer-orders", "daily"],
      });
    },
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      for (const order of filteredOrders) {
        // Just to be sure we don't turn a wall of DELIVERED into CHECKING...
        if (order.status === OrderStatus.PICKING) {
          // This is inefficient but it's kinda annoying to write a new route so...
          orderStatusMut.mutate({
            code: order.code,
            newStatus: OrderStatus.CHECKING,
          });
        }
      }
    },
  });

  const onToDetails = (code: string) => {
    navigate(`/customer/view-customer-order-detail/${code}`);
  };

  const onChangeQuery = (e) => {
    if (e.target.value) {
      setSearch((prev) => ({
        ...prev,
        query: e.target.value,
      }));
    } else {
      setSearch((prev) => ({
        ...prev,
        query: "",
      }));
    }
  };

  const onClearQuery = () => {
    setSearch((prev) => ({
      ...prev,
      query: "",
    }));
  };

  if (dailyOrderQuery.status === "pending") {
    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <Spinner></Spinner>
      </div>
    );
  }

  if (
    dailyOrderQuery.fetchStatus === "paused" ||
    (dailyOrderQuery.status === "error" &&
      dailyOrderQuery.fetchStatus === "idle")
  ) {
    if (dailyOrderQuery.fetchStatus === "paused") {
      return (
        <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
          <Alert type="error" message="Network Error" />
        </div>
      );
    }

    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <AlertFromQueryError queryError={dailyOrderQuery.error} />
      </div>
    );
  }

  if (dailyOrderQuery.data?.length === 0) {
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
        <CustomerListPrint printRef={printRef} orders={filteredOrders} />
      </div>

      <div className="m-4 flex flex-col items-center justify-between gap-3 xl:flex-row">
        <div className="flex items-center gap-2">
          <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
            <span>
              {filteredOrders.length}{" "}
              {filteredOrders.length > 1 ? "orders" : "order"}
            </span>
          </div>
          {showTotal ? (
            <button
              className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content"
              onClick={() => setShowTotal(false)}
            >
              <span>Total: ${total}</span>
            </button>
          ) : (
            <button
              className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content"
              onClick={() => setShowTotal(true)}
            >
              <span>Click to show total</span>
            </button>
          )}
          {/* {boxCount > 0 && (
            <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
              <span>{boxCount} boxes</span>
            </div>
          )} */}
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
        {filteredOrders.map((order) => (
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
            <div className="overflow-hidden text-ellipsis text-nowrap font-semibold">
              {order.customer_name}
            </div>
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
      {filteredOrders?.length < 1 && (
        <div className="text-center">Not found.</div>
      )}
    </>
  );
}
