import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import { convertTimeToText } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import SearchInput from "../../../../components/forms/SearchInput";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";

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
      });
  }, []);

  const onToDetails = (code: string) => {
    navigate(`/customer/view-customer-order-detail/${code}`);
  };

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = fetchData.orders.filter((order) =>
        order.customer_name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(e.target.value.toLowerCase().replace(/\s+/g, ""))
      );
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
    return <Spinner></Spinner>;
  }

  if (fetchData.error) {
    return (
      <div className="mx-auto w-11/12 md:w-10/12 lg:w-6/12">
        <Alert type="error" message={fetchData.error}></Alert>
      </div>
    );
  }

  if (fetchData.empty) {
    return (
      <div className="mx-auto w-11/12 md:w-10/12 lg:w-6/12">
        <Alert type="empty" message={fetchData.empty}></Alert>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto mb-5 w-11/12 md:w-10/12 lg:w-6/12">
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
      <div className="grid grid-cols-12 gap-2 px-4">
        {search.orders.map((order) => (
          <div
            key={order.code}
            className={`rounded-box col-span-12 border-2 p-3 shadow-md sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2
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
          >
            <div>#{order.manual_code ? order.manual_code : order.code}</div>
            <div className="font-semibold">{order.customer_name}</div>
            <div className="text-sm">
              {convertTimeToText(new Date(order.expected_at))}
            </div>
            <button
              className={`rounded-btn btn-sm btn mt-3 w-full
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
