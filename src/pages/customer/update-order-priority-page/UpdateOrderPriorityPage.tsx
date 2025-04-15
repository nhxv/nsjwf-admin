import { useEffect, useState } from "react";
import { OrderStatus } from "../../../commons/enums/order-status.enum";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import TabGroup from "../../../components/TabGroup";
import api from "../../../stores/api";
import EmployeeTaskList from "./components/EmployeeTaskList";
import { useNavigate } from "react-router-dom";
import { handleTokenExpire } from "../../../commons/utils/token.util";

export default function UpdateOrderPriorityPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(OrderStatus.PICKING);
  const [fetchData, setFetchData] = useState({
    tasks: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [reload, setReload] = useState(false);

  useEffect(() => {
    getEmployeeTaskList();
    // re-render after 1 min
    const reRender = setInterval(() => {
      getEmployeeTaskList();
    }, 60000);

    return () => {
      clearInterval(reRender);
    };
  }, [status, reload]);

  const getEmployeeTaskList = () => {
    setFetchData((prev) => ({
      ...prev,
      tasks: [],
      error: "",
      empty: "",
      loading: true,
    }));
    api
      .get(`/accounts/employee-tasks/${status}`)
      .then((res) => {
        if (res.data.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            tasks: [],
            error: "",
            empty: "Such hollow, much empty...",
            loading: false,
          }));
        }
        setFetchData((prev) => ({
          ...prev,
          tasks: res.data,
          error: "",
          empty: "",
          loading: false,
        }));
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e),
        );
        setFetchData((prev) => ({
          ...prev,
          tasks: [],
          error: error.message,
          empty: "",
          loading: false,
        }));

        if (error.status === 401) {
          handleTokenExpire(navigate, setFetchData);
        }
      });
  };

  const onClear = () => {
    setReload(!reload);
    setFetchData((prev) => ({
      ...prev,
      tasks: [],
      error: "",
      empty: "",
      loading: true,
    }));
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <section className="min-h-screen">
      <div className="my-8 flex justify-center">
        <TabGroup
          group={Object.values(OrderStatus).filter(
            (s) =>
              s !== OrderStatus.CANCELED &&
              s !== OrderStatus.CHECKING &&
              s !== OrderStatus.DELIVERED &&
              s !== OrderStatus.COMPLETED,
          )}
          selected={status}
          onSelect={setStatus}
          display={capitalizeFirst}
        ></TabGroup>
      </div>

      <div className="w-full">
        {fetchData.loading ? (
          <div className="flex justify-center">
            <Spinner></Spinner>
          </div>
        ) : (
          <>
            {fetchData.error ? (
              <Alert message={fetchData.error} type="error"></Alert>
            ) : (
              <>
                {fetchData.empty ? (
                  <Alert message={fetchData.empty} type="empty"></Alert>
                ) : (
                  <EmployeeTaskList
                    employeeTasks={fetchData.tasks}
                    reload={onClear}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
