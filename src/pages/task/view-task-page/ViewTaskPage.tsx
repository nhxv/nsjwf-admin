import { useState, useEffect } from "react";
import api from "../../../stores/api";
import { OrderStatus } from "../../../commons/order-status.enum";
import SelectInput from "../../../components/forms/SelectInput";
import Spinner from "../../../components/Spinner";
import { BiError, BiBot, BiX } from "react-icons/bi"; 
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
  const [dataState, setDataState] = useState({
    tasks: null,
    toast: "",
  });
  const nickname = useAuthStore((state) => JSON.parse(state.nickname));
  const [reload, setReload] = useState(false);

  useEffect(() => {
    let orderPromise = null;
    if (status === OrderStatus.PICKING || status === OrderStatus.SHIPPING) {
      orderPromise = api.get(`/customer-orders/tasks/search?nickname=${nickname}&status=${status}`);
    } else if (status === OrderStatus.CHECKING || OrderStatus.DELIVERED) {
      orderPromise = api.get(`/customer-orders/basic-list/${status}`);
    }
    orderPromise.then((res) => {
      if (res.data.length === 0) {
        setListState(prev => ({
          ...prev, 
          listEmpty: "Such hollow, much empty...", 
          listLoading: false
        }));
      } else {
        setListState(prev => ({
          ...prev, 
          listLoading: false
        }));
        setDataState(prev => ({...prev, toast: "", tasks: res.data}));
      }

    })
    .catch((e) => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setListState(prev => (
        {...prev, listError: error.message, listLoading: false}
      ));
    });

    // re-render after 1 min
    const reRender = setInterval(() => {
      getOrderList(orderPromise);
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
  }, [dataState]);

  const getOrderList = (orderPromise) => {
    orderPromise.then((res) => {
      if (res.data.length === 0) {
        setListState(prev => ({
          ...prev, 
          listEmpty: "Such hollow, much empty...", 
          listLoading: false
        }));
      } else {
        setListState(prev => ({
          ...prev, 
          listLoading: false
        }));
        // TODO: notification
        // const oldTaskList = [...dataState.tasks];
        // const newTaskList = [...res.data];
        // let updates = [];
        // console.log(dataState.tasks);
        // for (const newTask of newTaskList) {
        //   for (const oldTask of oldTaskList) {
        //     if (newTask.code === oldTask.code) {
        //       // 1. look to update product
        //       for (const newProduct of newTask.productCustomerOrders) {
        //         let isMatch = false;
        //         for (const oldProduct of oldTask.productCustomerOrders) {
        //           if (oldProduct.productName === newProduct.productName) {
        //             isMatch = true;
        //             if (oldProduct.quantity !== newProduct.quantity) {
        //               // update product quantity
        //               console.log(`update from ${oldProduct.quantity} to ${newProduct.quantity}`);
        //               updates.push(`#${newTask.code}`);
        //             }
        //           }
        //         }
        //         if (!isMatch) {
        //           // add a product
        //           updates.push(`#${newTask.code}`);
        //         }
        //       }
        //       // 2. look for deleted product
        //       for (const oldProduct of oldTask.productCustomerOrders) {
        //         let isMatch = false;
        //         for (const newProduct of newTask.productCustomerOrders) {
        //           if (oldProduct.productName === newProduct.productName) {
        //             isMatch = true;
        //           }
        //         }
        //         if (!isMatch) {
        //           // remove a product
        //           updates.push(`#${newTask.code}`);
        //         }
        //       }
        //     }
        //   }
        // }
        setDataState(prev => ({...prev, tasks: res.data}));
      }
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
    setReload(!reload);
    setListState(prev => ({...prev, listLoading: true}));
  }

  // const onCloseToast = () => {
  //   setDataState(prev => ({...prev, toast: ""}));
  // }

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
        <div className="flex flex-col items-center">
          <div className={`my-6 w-11/12 sm:w-8/12 md:w-6/12 flex justify-center`}>
            <div className="w-11/12">
              {/* <SelectInput name="status" id="status" 
              options={Object.values(OrderStatus).filter(
                status => status !== OrderStatus.CANCELED && status !== OrderStatus.COMPLETED
              )}
              onChange={onSelect}
              value={status}
              ></SelectInput> */}
              <ul className="steps w-full">
                {Object.values(OrderStatus)
                .filter(s => s !== OrderStatus.CANCELED && s !== OrderStatus.COMPLETED)
                .map((s) => (
                <li key={s} className={`cursor-pointer step text-sm font-medium 
                  ${checkStep(s) ? "text-primary step-primary" : ""}`}
                  onClick={() => setStep(s)}
                >{capitalizeFirst(s.toLowerCase())}</li>
                ))}
              </ul>
            </div>
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
                <TaskList orders={dataState.tasks} reload={forceReload} status={status} />
              </div>
              {/* {dataState.toast ? (              
              <div className="toast toast-center bottom-20 w-11/12 md:w-6/12 lg:w-3/12">
                <div className="p-4 flex justify-between items-center shadow-md bg-emerald-100 border-2 border-emerald-600 text-primary rounded-box">
                  <div><span className="font-semibold">{dataState.toast}</span></div>
                  <div>
                    <div className="hover:bg-emerald-200 p-1 rounded-full cursor-pointer" onClick={onCloseToast}>
                      <BiX className="w-7 h-7"></BiX>
                    </div>
                  </div>
                </div>
              </div>
              ) : (<></>)} */}
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