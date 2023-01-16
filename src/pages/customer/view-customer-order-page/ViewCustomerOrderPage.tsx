import { useEffect, useRef, useState } from "react";
import { BiBot, BiLayer } from "react-icons/bi";
import { useReactToPrint } from "react-to-print";
import useFirstRender from "../../../commons/hooks/first-render.hook";
import { OrderStatus } from "../../../commons/order-status.enum";
import { Role } from "../../../commons/role.enum";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";
import { useAuthStore } from "../../../stores/auth.store";
import CustomerOrderList from "./components/CustomerOrderList";
import PackingSlipToPrint from "./components/PackingSlipToPrint";

export default function ViewCustomerOrderPage() {
  const isFirstRender = useFirstRender();
  const [listState, setListState] = useState({
    listError: "",
    listEmpty: "",
    listLoading: true,
  });
  const [status, setStatus] = useState(OrderStatus.PICKING);
  const [customerOrderList, setCustomerOrderList] = useState([]);
  const batchToPrintRef = useRef<HTMLDivElement>(null);
  const handleBatchPrint = useReactToPrint({
    content: () => batchToPrintRef.current,
  });

  useEffect(() => {
    getCustomerOrders();
    // re-render after 1 min
    const reRender = setInterval(() => {
      getCustomerOrders();
    }, 60000);

    return () => {
      clearInterval(reRender);
    }
  }, [status]);

  useEffect(() => {
    if (!isFirstRender) {
      setListState(prev => ({...prev, listError: "", listEmpty: "", listLoading: false}));
    }
  }, [customerOrderList]);

  const getCustomerOrders = () => {
    setListState(prev => ({...prev, listError: "", listEmpty: "", listLoading: true}));
    api.get(`/customer-orders/basic-list/${status}`)
    .then((res) => {
      if (res.data.length === 0) {
        setListState(prev => ({
          ...prev, 
          listEmpty: "Such hollow, much empty...", 
          listLoading: false,
        }));
      }
      setListState(prev => ({...prev, listError: "", listEmpty: "", listLoading: false}));
      setCustomerOrderList(res.data);
    })
    .catch((e) => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setListState(prev => (
        {...prev, listError: error.message, listLoading: false}
      ));
    });
  }

  const onBatchPrint = () => {
    handleBatchPrint();
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
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
      setListState({listError: "", listEmpty: "", listLoading: true});
    }
  }

  const checkStep = (step: string) => {
    const s = step.toUpperCase();
    if (s === status) {
      return true;
    } else if (s === OrderStatus.PICKING) {
      return true;
    } else if (
      s === OrderStatus.CHECKING && 
      (status === OrderStatus.SHIPPING || status === OrderStatus.DELIVERED)) {
      return true;
    } else if (s === OrderStatus.SHIPPING && status === OrderStatus.DELIVERED) {
      return true;
    }
    return false;
  }

  return (
    <>
      <section className="min-h-screen">
        <div className="flex flex-col items-center container">
          <div className={`my-6 w-11/12 sm:w-8/12 xl:w-6/12 flex justify-center`}>
            <div className="w-11/12">
              <ul className="steps w-full">
                {Object.values(OrderStatus)
                .filter(s => s !== OrderStatus.CANCELED && s !== OrderStatus.COMPLETED)
                .map((s) => (
                <li key={s} className={`cursor-pointer step font-medium text-sm sm:text-base
                  ${checkStep(s) ? "text-primary step-primary" : ""}`}
                  onClick={() => setStep(s)}
                >{capitalizeFirst(s.toLowerCase())}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="hidden">
            <div ref={batchToPrintRef}>
              {customerOrderList.map((order, index) => (
              <div key={`customer-order-${index}`}>
                <PackingSlipToPrint printRef={null} order={order} />
              </div>
              ))}
            </div>
          </div> 

          {listState.listLoading ? (
          <Spinner></Spinner>
          ) : (
          <div className="w-11/12 sm:w-8/12 md:w-6/12">
            {listState.listError ? (
            <Alert message={listState.listError} type="error"></Alert>
            ) : (
            <>
              {listState.listEmpty ? (
              <Alert message={listState.listEmpty} type="empty"></Alert>
              ) : (
              <div>
                <CustomerOrderList orders={customerOrderList} printMode={status !== OrderStatus.COMPLETED ? true : false} />
                {(!listState.listEmpty && !listState.listError && !listState.listLoading) ? (         
                <div className="flex justify-center mb-6">
                  <button type="button" className="btn btn-accent" onClick={onBatchPrint}>
                    <span className="mr-2">Print all orders</span>
                    <BiLayer className="w-6 h-6"></BiLayer>
                  </button>
                </div>
                ): null}
              </div>
              )}
            </>
            )}
          </div>)}    
        </div>
      </section>
    </>
  )
}