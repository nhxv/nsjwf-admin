import { OrderStatus } from "../../../commons/order-status.enum"
import { useEffect, useState } from "react";
import Spinner from "../../../components/Spinner";
import useFirstRender from "../../../commons/hooks/first-render.hook";
import Alert from "../../../components/Alert";
import EmployeeTaskList from "./components/EmployeeTaskList";
import api from "../../../stores/api";

export default function UpdateOrderPriorityPage() {
  const isFirstRender = useFirstRender();
  const [status, setStatus] = useState(OrderStatus.PICKING);
  const [listState, setListState] = useState({
    listError: "",
    listEmpty: "",
    listLoading: true,
  });
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
  }, [status]);

  useEffect(() => {
    if (!isFirstRender) {
      setListState(prev => (
        {...prev, listLoading: false}
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
          listEmpty: "Such hollow, much empty...", 
          listLoading: false
        }));
      }
      setListState(prev => ({...prev, listError: "", listEmpty: "", listLoading: false}));
      setEmployeeTaskList(res.data);
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

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  const setStep = (step: string) => {
    const s = step.toUpperCase();
    if (s === OrderStatus.PICKING) {
      setStatus(OrderStatus.PICKING);
    } else if (s === OrderStatus.SHIPPING) {
      setStatus(OrderStatus.SHIPPING);
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
    }
    return false;
  }

  return (
  <section className="min-h-screen">
    <div className="flex flex-col items-center container">
      <div className="my-6 w-11/12 sm:w-8/12 xl:w-6/12 flex justify-center">
        <div className="w-11/12">
          <ul className="steps w-full">
            {Object.values(OrderStatus)
            .filter(s => 
              s !== OrderStatus.CANCELED && 
              s !== OrderStatus.COMPLETED &&
              s !== OrderStatus.CHECKING &&
              s !== OrderStatus.DELIVERED
            )
            .map((s) => (
            <li key={s} className={`cursor-pointer step text-sm sm:text-base font-medium 
              ${checkStep(s) ? "text-primary step-primary" : ""}`}
              onClick={() => setStep(s)}
            >{capitalizeFirst(s.toLowerCase())}</li>
            ))}
          </ul>
        </div>
      </div>          
    </div>
    
    <div className="container w-full">
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
          <>
            <EmployeeTaskList employeeTasks={employeeTaskList} />
          </>
          )}
        </>
        )}
      </>)}
    </div>        
  </section>
  )
}