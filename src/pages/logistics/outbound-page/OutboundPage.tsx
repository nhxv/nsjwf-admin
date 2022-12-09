import { useState, useEffect } from "react";
import api from "../../../stores/api";
import { OrderStatus } from "../../../commons/order-status.enum";
import SelectInput from "../../../components/SelectInput";
import Spinner from "../../../components/Spinner";
import { BiError, BiBot } from "react-icons/bi"; 
import CustomerOrderList from "./components/CustomerOrderList";
import useFirstRender from "../../../commons/hooks/first-render.hook";

export default function OutboundPage() {
  const isFirstRender = useFirstRender();
  const [listState, setListState] = useState({
    listError: "",
    listEmpty: "",
    listLoading: true,
  });
  const [status, setStatus] = useState(OrderStatus.PICKING);
  const [customerOrderList, setCustomerOrderList] = useState([]);

  useEffect(() => {
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
  }, [status]);

  useEffect(() => {
    if (!isFirstRender) {
      setListState(prev => (
        {...prev, listLoading: false}
      ));
    }
  }, [customerOrderList]);

  const onSelect = (e) => {
    setStatus(e.target.value);
    setListState({listError: "", listEmpty: "", listLoading: true});
  }

  return (
    <>
      <section className="min-h-screen">
        <h1 className="text-center font-bold text-xl my-4">Outbound</h1>
        <div className="flex flex-col items-center">
          <div className="mb-8">
            <SelectInput name="status" id="status" 
            options={Object.values(OrderStatus)}
            onChange={onSelect}
            value={status}
            ></SelectInput>
          </div>

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
                <CustomerOrderList orders={customerOrderList} />
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