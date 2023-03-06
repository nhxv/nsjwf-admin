import { useEffect, useRef, useState } from "react";
import { BiGridAlt, BiLayer } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { OrderStatus } from "../../../commons/enums/order-status.enum";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import Stepper from "../../../components/Stepper";
import api from "../../../stores/api";
import CustomerOrderList from "./components/CustomerOrderList";
import PackingSlipToPrint from "./components/PackingSlipToPrint";

export default function ViewCustomerOrderPage() {
  const [fetchData, setFetchData] = useState({
    orders: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [status, setStatus] = useState(OrderStatus.PICKING);
  // const [customerOrderList, setCustomerOrderList] = useState([]);
  const batchToPrintRef = useRef<HTMLDivElement>(null);
  const handleBatchPrint = useReactToPrint({
    content: () => batchToPrintRef.current,
  });
  const navigate = useNavigate();

  useEffect(() => {
    getCustomerOrders();
    // re-render after 1 min
    const reRender = setInterval(() => {
      getCustomerOrders();
    }, 60000);

    return () => {
      clearInterval(reRender);
    };
  }, [status]);

  const getCustomerOrders = () => {
    setFetchData((prev) => ({
      ...prev,
      error: "",
      empty: "",
      loading: true,
    }));
    api
      .get(`/customer-orders/basic-list/${status}`)
      .then((res) => {
        if (res.data.length === 0) {
          setFetchData((prev) => ({
            ...prev,
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
          empty: "",
          error: error.message,
          loading: false,
        }));
      });
  };

  const onBatchPrint = () => {
    handleBatchPrint();
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const setStep = (step: string) => {
    const s = step.toUpperCase();
    if (s === OrderStatus.PICKING) {
      setStatus(OrderStatus.PICKING);
    } else if (s === OrderStatus.CHECKING) {
      setStatus(OrderStatus.CHECKING);
    } else if (s === OrderStatus.SHIPPING) {
      setStatus(OrderStatus.SHIPPING);
    } else if (s === OrderStatus.DELIVERED) {
      setStatus(OrderStatus.DELIVERED);
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

  const onSwitchView = () => {
    navigate(`/customer/overview-customer-order`);
  };

  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Customer order</h1>
      <div className="fixed bottom-24 right-6 z-20 md:right-8">
        <button className="btn-accent btn-circle btn" onClick={onSwitchView}>
          <span>
            <BiGridAlt className="h-6 w-6"></BiGridAlt>
          </span>
        </button>
      </div>
      <div className="flex justify-center">
        <div className="w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
          <div className="my-6">
            <Stepper
              steps={Object.values(OrderStatus).filter(
                (s) => s !== OrderStatus.CANCELED && s !== OrderStatus.COMPLETED
              )}
              selected={status}
              onSelect={setStep}
              display={capitalizeFirst}
            ></Stepper>
          </div>

          <div className="hidden">
            <div ref={batchToPrintRef}>
              {fetchData.orders.map((order, index) => (
                <div key={`customer-order-${index}`}>
                  <PackingSlipToPrint printRef={null} order={order} />
                </div>
              ))}
            </div>
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
                    <div>
                      <CustomerOrderList
                        orders={fetchData.orders}
                        printMode={
                          status !== OrderStatus.COMPLETED ? true : false
                        }
                      />
                      {!fetchData.empty &&
                        !fetchData.error &&
                        !fetchData.loading && (
                          <div className="mb-6 flex justify-center">
                            <button
                              type="button"
                              className="btn-accent btn"
                              onClick={onBatchPrint}
                            >
                              <span className="mr-2">Print all orders</span>
                              <BiLayer className="h-6 w-6"></BiLayer>
                            </button>
                          </div>
                        )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
