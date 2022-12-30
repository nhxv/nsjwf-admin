import { useState, useEffect } from "react";
import api from "../../../stores/api";
import { OrderStatus } from "../../../commons/order-status.enum";
import SelectInput from "../../../components/forms/SelectInput";
import Spinner from "../../../components/Spinner";
import { BiError, BiBot } from "react-icons/bi"; 
import TaskList from "./components/TaskList";
import useFirstRender from "../../../commons/hooks/first-render.hook";
import { useAuthStore } from "../../../stores/auth.store";

export default function ViewTaskPage() {
  const isFirstRender = useFirstRender();
  const [listState, setListState] = useState({
    listError: "",
    listEmpty: "",
    listLoading: true,
  });
  const [status, setStatus] = useState(OrderStatus.PICKING);
  const [taskList, setTaskList] = useState([]);
  const nickname = useAuthStore((state) => JSON.parse(state.nickname));
  const [reload, setReload] = useState(false);

  useEffect(() => {
    getTaskList();
    // re-render after 1 min
    const reRender = setInterval(() => {
      getTaskList();
    }, 60000);

    return () => {
      clearInterval(reRender);
    }
  }, [status, reload]);

  useEffect(() => {
    if (!isFirstRender) {
      setListState(prev => (
        {...prev, listLoading: false}
      ));
    }
  }, [taskList]);

  const getTaskList = () => {
    api.get(`/customer-orders/tasks/search?nickname=${nickname}&status=${status}`)
    .then((res) => {
      if (res.data.length === 0) {
        setListState(prev => ({
          ...prev, 
          listEmpty: "Such hollow, much empty...", 
          listLoading: false
        }));
      }
      setTaskList(res.data);
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

  const forceReload = () => {
    console.log("force reload");
    setReload(!reload);
    setListState(prev => ({...prev, listLoading: true}));
  }

  return (
    <>
      <section className="min-h-screen">
        <div className="flex flex-col items-center">
          <div className="my-6">
            <SelectInput name="status" id="status" 
            options={Object.values(OrderStatus).filter(
              status => 
              status !== OrderStatus.CHECKING &&
              status !== OrderStatus.DELIVERED && 
              status !== OrderStatus.COMPLETED &&
              status !== OrderStatus.CANCELED
            )}
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
                <TaskList orders={taskList} reload={forceReload} />
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