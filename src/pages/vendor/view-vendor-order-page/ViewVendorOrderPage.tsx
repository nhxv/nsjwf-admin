import { useEffect, useState } from "react";
import { OrderStatus } from "../../../commons/enums/order-status.enum";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";
import VendorOrderList from "./components/VendorOrderList";
import Stepper from "../../../components/Stepper";

export default function ViewVendorOrderPage() {
  const [fetchData, setFetchData] = useState({
    orders: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [status, setStatus] = useState(OrderStatus.SHIPPING);

  useEffect(() => {
    api
      .get(`/vendor-orders/basic-list/${status}`)
      .then((res) => {
        if (res.data.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            orders: [],
            error: "",
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
  }, [status]);

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const setStep = (step: string) => {
    const s = step.toUpperCase();
    if (s === OrderStatus.SHIPPING) {
      setStatus(OrderStatus.SHIPPING);
    } else if (s === OrderStatus.COMPLETED) {
      setStatus(OrderStatus.COMPLETED);
    }
    if (s !== status) {
      setFetchData((prev) => ({
        ...prev,
        orders: [],
        error: "",
        empty: "",
        loading: true,
      }));
    }
  };

  return (
    <>
      <section className="min-h-screen">
        <div className="flex justify-center">
          <div className="w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
            <div className="my-6">
              <Stepper
                steps={Object.values(OrderStatus).filter(
                  (s) =>
                    s !== OrderStatus.CANCELED &&
                    s !== OrderStatus.PICKING &&
                    s !== OrderStatus.CHECKING &&
                    s !== OrderStatus.DELIVERED
                )}
                selected={status}
                onSelect={setStep}
                display={capitalizeFirst}
              ></Stepper>
            </div>

            {fetchData.loading ? (
              <Spinner></Spinner>
            ) : (
              <>
                {fetchData.error ? (
                  <Alert message={fetchData.error} type="error"></Alert>
                ) : (
                  <>
                    {fetchData.empty ? (
                      <Alert message={fetchData.empty} type="empty"></Alert>
                    ) : (
                      <VendorOrderList orders={fetchData.orders} />
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
