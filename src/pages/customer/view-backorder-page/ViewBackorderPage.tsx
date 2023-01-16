import { useEffect, useState } from "react";
import { BackorderStatus } from "../../../commons/backorder-status.enum";
import useFirstRender from "../../../commons/hooks/first-render.hook";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";
import BackorderList from "./components/BackorderList";

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

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  const setStep = (step: string) => {
    const s = step.toUpperCase();
    if (s === BackorderStatus.PENDING) {
      setStatus(BackorderStatus.PENDING);
    } else if (s === BackorderStatus.ARCHIVED) {
      setStatus(BackorderStatus.ARCHIVED);
    }
    if (s !== status) {
      setListState({listError: "", listEmpty: "", listLoading: true});
    }
  }

  const checkStep = (step: string) => {
    const s = step.toUpperCase();
    if (s === status) {
      return true;
    } else if (s === BackorderStatus.PENDING) {
      return true;
    }
    return false;
  }  

  return (
    <>
      <section className="min-h-screen">
        <div className="flex flex-col items-center">
          <div className={`my-6 w-11/12 sm:w-8/12 xl:w-6/12 flex justify-center`}>
            <div className="w-11/12">
              <ul className="steps w-full">
                {Object.values(BackorderStatus).map((s) => (
                <li key={s} className={`cursor-pointer step text-sm sm:text-base font-medium 
                  ${checkStep(s) ? "text-primary step-primary" : ""}`}
                  onClick={() => setStep(s)}
                >{capitalizeFirst(s.toLowerCase())}</li>
                ))}
              </ul>
            </div>
          </div>

          {listState.listLoading ? (
          <Spinner></Spinner>
          ) : (
          <div className="w-11/12 sm:w-8/12 xl:w-6/12">
            {listState.listError ? (
            <Alert message={listState.listError} type="error"></Alert>
            ) : (
            <>
              {listState.listEmpty ? (
              <Alert message={listState.listEmpty} type="empty"></Alert>
              ) : (
              <BackorderList orders={backorderList} />
              )}
            </>
            )}
          </div>)}    
        </div>
      </section>
    </>
  )
}