import { useEffect, useState } from "react";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";
import CustomerReturnList from "./components/CustomerReturnList";

export default function ViewCustomerReturnPage() {
  const [fetchData, setFetchData] = useState({
    returns: [],
    error: "",
    empty: "",
    loading: true,
  });

  useEffect(() => {
    api
      .get(`/customer-returns`)
      .then((res) => {
        if (res.data.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            returns: [],
            empty: "Such hollow, much empty...",
            error: "",
            loading: false,
          }));
        } else {
          setFetchData((prev) => ({
            ...prev,
            returns: res.data,
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
          returns: [],
          error: error.message,
          empty: "",
          loading: false,
        }));
      });
  }, []);

  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Customer return</h1>
      <div className="flex justify-center">
        <div className="w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
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
                    <CustomerReturnList returns={fetchData.returns} />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
