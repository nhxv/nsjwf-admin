import { useEffect, useState } from "react";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";
import VendorReturnList from "./components/VendorReturnList";
import { handleTokenExpire } from "../../../commons/utils/token.util";
import { useNavigate } from "react-router-dom";

export default function ViewVendorReturnPage() {
  const navigate = useNavigate();
  const [fetchData, setFetchData] = useState({
    returns: [],
    error: "",
    empty: "",
    loading: true,
  });

  useEffect(() => {
    api
      .get(`/vendor-returns`)
      .then((res) => {
        if (res.data.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            returns: [],
            error: "",
            empty: "Such hollow, much empty...",
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
          empty: "",
          error: error.message,
          loading: false,
        }));

        if (error.status === 401) {
          handleTokenExpire(navigate, setFetchData);
        }
      });
  }, []);

  return (
    <>
      <section className="min-h-screen">
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
                      <VendorReturnList returns={fetchData.returns} />
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
