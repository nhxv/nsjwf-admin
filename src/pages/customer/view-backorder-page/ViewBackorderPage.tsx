import { useEffect, useState } from "react";
import { BackorderStatus } from "../../../commons/enums/backorder-status.enum";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import Stepper from "../../../components/Stepper";
import api from "../../../stores/api";
import BackorderList from "./components/BackorderList";

export default function ViewBackorderPage() {
  const [fetchData, setFetchData] = useState({
    backorders: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [status, setStatus] = useState(BackorderStatus.PENDING);

  useEffect(() => {
    api
      .get(`/backorders/basic-list/${status}`)
      .then((res) => {
        if (res.data.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            error: "",
            empty: "Such hollow, much empty...",
            loading: false,
          }));
        } else {
          setFetchData((prev) => ({
            ...prev,
            backorders: res.data,
            error: "",
            empty: "",
            loading: false,
          }));
        }
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFetchData((prev) => ({
          ...prev,
          backorders: [],
          error: error.message,
          empty: "",
          loading: false,
        }));
      });
  }, [status])


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
      setFetchData((prev) => ({
        ...prev,
        backorders: [],
        error: "",
        empty: "",
        loading: true,
      }));
    }
  }

  return (
    <>
      <section className="min-h-screen">
        <div className="flex justify-center">
          <div className="w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
            <div className="my-6">
              <Stepper
                steps={Object.values(BackorderStatus)}
                selected={status}
                onSelect={setStep}
                display={capitalizeFirst}
              ></Stepper>
            </div>

            {fetchData.loading ? (
              <Spinner></Spinner>
            ) : (
              <>
                {fetchData.error ? (
                  <Alert message={fetchData.error} type="error"></Alert>
                ) : (
                  <>
                    {fetchData.empty ? (
                      <Alert message={fetchData.empty} type="empty"></Alert>
                    ) : (
                      <BackorderList orders={fetchData.backorders} />
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
