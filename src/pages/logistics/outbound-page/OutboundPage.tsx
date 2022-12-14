import { useState, useEffect, useRef } from "react";
import api from "../../../stores/api";
import { OrderStatus } from "../../../commons/order-status.enum";
import SelectInput from "../../../components/SelectInput";
import Spinner from "../../../components/Spinner";
import { BiError, BiBot } from "react-icons/bi"; 
import CustomerOrderList from "./components/CustomerOrderList";
import useFirstRender from "../../../commons/hooks/first-render.hook";
import { useAuthStore } from "../../../stores/auth.store";
import { Role } from "../../../commons/role.enum";
import { useReactToPrint } from "react-to-print";
import PackingSlipToPrint from "./components/PackingSlipToPrint";

export default function OutboundPage() {
  const isFirstRender = useFirstRender();
  const [listState, setListState] = useState({
    listError: "",
    listEmpty: "",
    listLoading: true,
  });
  const [status, setStatus] = useState(OrderStatus.PICKING);
  const [customerOrderList, setCustomerOrderList] = useState([]);
  const role = useAuthStore((state) => state.role);
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
      setListState(prev => (
        {...prev, listLoading: false}
      ));
    }
  }, [customerOrderList]);

  const getCustomerOrders = () => {
    api.get(`/customer-orders/basic-list/${status}`)
    .then((res) => {
      if (res.data.length === 0) {
        setListState(prev => ({
          ...prev, 
          listEmpty: "Such hollow, much empty...", 
          listLoading: false
        }));
      }
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

  const onSelect = (e) => {
    setStatus(e.target.value);
    setListState({listError: "", listEmpty: "", listLoading: true});
  }

  const onBatchPrint = () => {
    console.log(customerOrderList);
    handleBatchPrint();
  }

  return (
    <>
      <section className="min-h-screen">
        <div className="flex flex-col items-center">
          <div className={`my-6 w-11/12 sm:w-8/12 md:w-6/12 flex ${role === Role.ADMIN || role === Role.MASTER ? "justify-between" : "justify-center"}`}>
            <div>
              <SelectInput name="status" id="status" 
              options={Object.values(OrderStatus)}
              onChange={onSelect}
              value={status}
              ></SelectInput>
            </div>
            {(role === Role.ADMIN || role === Role.MASTER) && 
            (!listState.listEmpty && !listState.listError && !listState.listLoading) ? (            
            <div className="text-end">
              <button type="button" className="btn btn-accent text-black"
              onClick={onBatchPrint}>Print all</button>
            </div>
            ): (<></>)}
          </div>
          {(role === Role.ADMIN || role === Role.MASTER) ? (
          <div className="hidden">
            <div ref={batchToPrintRef}>
              {customerOrderList.map((order, index) => (
              <div key={`customer-order-${index}`}>
                <PackingSlipToPrint printRef={null} order={order} />
              </div>
              ))}
            </div>
          </div>      
          ): (<></>)}

          {listState.listLoading ? (
          <>
            <div className="flex justify-center">
              <Spinner></Spinner>
            </div>            
          </>
          ) : (
          <>
            {listState.listError ? (
            <>
            <div className="w-11/12 sm:w-8/12 md:w-6/12 alert alert-error text-red-700 flex justify-center">
              <div>
                <BiError className="flex-shrink-0 w-6 h-6"></BiError>
                <span>{listState.listError}</span>
              </div>
            </div>              
            </>
            ) : (
            <>
              {listState.listEmpty ? (
              <>
                <div className="w-11/12 sm:w-8/12 md:w-6/12 alert bg-gray-300 text-black flex justify-center">
                  <div>
                    <BiBot className="flex-shrink-0 w-6 h-6"></BiBot>
                    <span>{listState.listEmpty}</span>
                  </div>
                </div>                
              </>
              ) : (
              <>
              <div className="w-11/12 sm:w-8/12 md:w-6/12">
                <CustomerOrderList orders={customerOrderList} 
                printMode={(role === Role.MASTER || role === Role.ADMIN) ? true : false} />
              </div>
              </>
              )}
            </>
            )}
          </>)}    
        </div>
      </section>
    </>
  )
}