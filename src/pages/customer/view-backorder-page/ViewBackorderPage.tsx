import { useState, useEffect } from "react";
import api from "../../../stores/api";
import useFirstRender from "../../../commons/hooks/first-render.hook";
import Spinner from "../../../components/Spinner";
import { BiError, BiBot } from "react-icons/bi";
import BackorderList from "./components/BackorderList";
import { BackorderStatus } from "../../../commons/backorder-status.enum";
import SelectInput from "../../../components/forms/SelectInput";

export default function ViewBackorderPage() {
  const isFirstRender = useFirstRender();
  const [listState, setListState] = useState({
    listError: "",
    listEmpty: "",
    listLoading: true,
  });
  const [status, setStatus] = useState(BackorderStatus.PENDING);
  const [backorderList, setBackorderList] = useState([]);

  useEffect(() => {
    api.get(`/backorders/basic-list/${status}`)
    .then((res) => {
      if (res.data.length === 0) {
        setListState(prev => ({
          ...prev, 
          listEmpty: "Such hollow, much empty...", 
          listLoading: false,
        }));
      }
      setBackorderList(res.data);
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
  }, [backorderList]);

  const onSelect = (e) => {
    setStatus(e.target.value);
    setListState({listError: "", listEmpty: "", listLoading: true});
  }

  return (
    <>
      <section className="min-h-screen">
        <div className="flex flex-col items-center">
          <div className="my-6">
            <SelectInput name="status" id="status" 
            options={Object.values(BackorderStatus)}
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
                  <BackorderList orders={backorderList} />
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