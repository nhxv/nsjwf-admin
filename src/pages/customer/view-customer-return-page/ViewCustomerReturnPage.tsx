import Spinner from "../../../components/Spinner";
import { BiError, BiBot } from "react-icons/bi";
import useFirstRender from "../../../commons/hooks/first-render.hook";
import { useState, useEffect } from "react";
import CustomerReturnList from "./components/CustomerReturnList";
import api from "../../../stores/api";

export default function ViewCustomerReturnPage() {
  const isFirstRender = useFirstRender();
  const [listState, setListState] = useState({
    listError: "",
    listEmpty: "",
    listLoading: true,
  });
  const [customerReturnList, setCustomerReturnList] = useState([]);

  useEffect(() => {
    api.get(`/customer-returns`)
    .then((res) => {
      if (res.data.length === 0) {
        setListState(prev => ({
          ...prev, 
          listEmpty: "Such hollow, much empty...", 
          listLoading: false
        }));
      }
      setCustomerReturnList(res.data);
    })
    .catch((e) => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setListState(prev => (
        {...prev, listError: error.message, listLoading: false}
      ));
    });
  }, []);

  useEffect(() => {
    if (!isFirstRender) {
      setListState(prev => (
        {...prev, listLoading: false}
      ));
    }
  }, [customerReturnList]);

  return (
  <>
  <section className="min-h-screen">
    <h1 className="text-center font-bold text-xl my-4">Customer return</h1>
    <div className="flex flex-col items-center">     
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
            <CustomerReturnList returns={customerReturnList} />
          </div>
          </>
          )}
        </>
        )}
      </>)}
    </div>    
  </section>
  </>
  );
}