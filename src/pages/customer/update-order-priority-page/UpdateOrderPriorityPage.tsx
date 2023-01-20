import { OrderStatus } from "../../../commons/order-status.enum"
import { useEffect, useState } from "react";
import Spinner from "../../../components/Spinner";
import useFirstRender from "../../../commons/hooks/first-render.hook";
import Alert from "../../../components/Alert";
import EmployeeTaskList from "./components/EmployeeTaskList";
import api from "../../../stores/api";
import TabGroup from "../../../components/TabGroup";

export default function UpdateOrderPriorityPage() {
  const isFirstRender = useFirstRender();
  const [status, setStatus] = useState(OrderStatus.PICKING);
  const [listState, setListState] = useState({
    listError: "",
    listEmpty: "",
    listLoading: true,
  });
  const [reload, setReload] = useState(false);
  const [employeeTaskList, setEmployeeTaskList] = useState([]);

  useEffect(() => {
    getEmployeeTaskList();
    // re-render after 1 min
    const reRender = setInterval(() => {
      getEmployeeTaskList();
    }, 60000);
    
    return () => {
      clearInterval(reRender);
    }
  }, [status, reload]);

  useEffect(() => {
    if (!isFirstRender) {
      setListState(prev => (
        {...prev, listError: "", listEmpty: "", listLoading: false}
      ));
    }
  }, [employeeTaskList]);

  const getEmployeeTaskList = () => {
    setListState(prev => ({...prev, listError: "", listEmpty: "", listLoading: true}));
    api.get(`/accounts/employee-tasks/${status}`)
    .then((res) => {
      if (res.data.length === 0) {
        setListState(prev => ({
          ...prev,
          listError: "", 
          listEmpty: "Such hollow, much empty...", 
          listLoading: false
        }));
      }
      setEmployeeTaskList(res.data);
      setListState(prev => ({...prev, listError: "", listEmpty: "", listLoading: false}));
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

  const onClear = () => {
    setReload(!reload);
    setListState(prev => ({...prev, listError: "", listEmpty: "", loading: true}));
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
  <section className="min-h-screen">
    <div className="flex justify-center my-8">
      <TabGroup group={Object.values(OrderStatus).filter(s => 
          s !== OrderStatus.CANCELED && 
          s !== OrderStatus.CHECKING && 
          s !== OrderStatus.DELIVERED && 
          s !== OrderStatus.COMPLETED
        )} selected={status} onSelect={setStatus} display={capitalizeFirst}></TabGroup>
    </div>
    
    <div className="w-full">
      {listState.listLoading ? (
      <div className="flex justify-center">
        <Spinner></Spinner>
      </div>            
      ) : (
      <>
        {listState.listError ? (
        <Alert message={listState.listError} type="error"></Alert>
        ) : (
        <>
          {listState.listEmpty ? (
          <Alert message={listState.listEmpty} type="empty"></Alert>
          ) : (
            <EmployeeTaskList employeeTasks={employeeTaskList} reload={onClear} />
          )}
        </>
        )}
      </>)}
    </div>        
  </section>
  )
}