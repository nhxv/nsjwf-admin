import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import { convertTimeToText } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import SearchInput from "../../../../components/forms/SearchInput";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { handleTokenExpire } from "../../../../commons/utils/token.util";

export default function CustomerOrderList() {
  const [fetchData, setFetchData] = useState({
    orders: [],
    error: "",
    empty: "",
    loading: true,
  });
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    orders: [],
    query: "",
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

  useEffect(() => {
    getCustomerOrders();
    // re-render after 1 min
    const reRender = setInterval(() => {
      getCustomerOrders();
    }, 60000);

    return () => {
      clearInterval(reRender);
    };
  }, []);

  const getCustomerOrders = () => {
    setFetchData((prev) => ({
      ...prev,
      error: "",
      empty: "",
      loading: true,
    }));

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
          setSearch((prev) => ({ ...prev, orders: res.data, query: "" }));
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

        if (error.status === 401) {
          handleTokenExpire(navigate, setFetchData);
        }
      });
  };

  const onToDetails = (code: string) => {
    navigate(`/customer/view-customer-order-detail/${code}`);
  };

  const onChangeSearch = (e) => {
    if (e.target.value) {
      // Search based on customer name and product name.
      const searched = fetchData.orders.filter((order) => {
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
      });
      setSearch((prev) => ({
        ...prev,
        orders: searched,
        query: e.target.value,
      }));
    } else {
      setSearch((prev) => ({
        ...prev,
        orders: fetchData.orders,
        query: e.target.value,
      }));
    }
  };

  const onClearQuery = () => {
    setSearch((prev) => ({ ...prev, orders: fetchData.orders, query: "" }));
  };

  if (fetchData.loading) {
    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <Spinner></Spinner>
      </div>
    );
  }

  if (fetchData.error) {
    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <Alert type="error" message={fetchData.error}></Alert>
      </div>
    );
  }

  if (fetchData.empty) {
    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <Alert type="empty" message={fetchData.empty}></Alert>
      </div>
    );
  }

  return (
    <>
      <div className="m-4 flex flex-col items-center justify-between gap-3 xl:flex-row">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Overview</h1>
          <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
            <span>{search.orders.length} order(s)</span>
          </div>
          <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
            <span>${total} in total</span>
          </div>
        </div>
        <div>
          <div>
            <SearchInput
              id="order-search"
              name="order-search"
              placeholder="Search orders"
              value={search.query}
              onChange={(e) => onChangeSearch(e)}
              onClear={onClearQuery}
              onFocus={null}
            ></SearchInput>
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
                ? "border-neutral bg-base-100 dark:border-neutral dark:bg-base-200"
                : ""
            }
            ${
              order.status === OrderStatus.SHIPPING
                ? "border-purple-700 bg-purple-100 text-purple-700 dark:border-purple-700 dark:bg-purple-900 dark:bg-opacity-10"
                : ""
            }
            ${
              order.status === OrderStatus.DELIVERED
                ? "border-sky-700 bg-sky-100 text-sky-700 dark:border-sky-700 dark:bg-sky-900 dark:bg-opacity-10"
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
                ? "border-neutral bg-transparent text-neutral hover:border-neutral hover:bg-neutral hover:text-white"
                : ""
            }
            ${
              order.status === OrderStatus.SHIPPING
                ? "border-purple-700 bg-transparent text-purple-700 hover:border-purple-700 hover:bg-purple-700 hover:text-white"
                : ""
            }
            ${
              order.status === OrderStatus.DELIVERED
                ? "border-sky-700 bg-transparent text-sky-700 hover:border-sky-700 hover:bg-sky-700 hover:text-white"
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
