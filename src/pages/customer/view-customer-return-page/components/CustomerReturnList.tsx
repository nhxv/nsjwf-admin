import { useEffect, useState } from "react";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";

export default function CustomerReturnList() {
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

  if (fetchData.loading) {
    return <Spinner></Spinner>;
  }

  if (fetchData.error) {
    return <Alert message={fetchData.error} type="error"></Alert>;
  }

  if (fetchData.empty) {
    return <Alert message={fetchData.empty} type="empty"></Alert>;
  }

  return (
    <>
      {fetchData.returns.map((customerReturn) => {
        return (
          <div key={customerReturn.orderCode} className="custom-card mb-8">
            {/* basic order info */}
            <div className="flex flex-row justify-between">
              <div>
                <div>
                  <span>#{customerReturn.orderCode}</span>
                </div>
                <div>
                  <span className="text-xl font-semibold">
                    {customerReturn.customerName}
                  </span>
                </div>
              </div>
            </div>
            <div className="divider"></div>
            {/* products in order */}
            <div className="mb-2 flex items-center">
              <div className="w-6/12">
                <span className="font-medium">Product</span>
              </div>
              <div className="w-6/12 text-center">
                <span className="font-medium">Qty</span>
              </div>
            </div>
            {customerReturn.productCustomerReturns.map((productReturn) => {
              return (
                <div
                  key={productReturn.unitCode}
                  className="rounded-btn mb-2 flex items-center bg-base-200 py-3 dark:bg-base-300"
                >
                  <div className="ml-3 w-6/12">
                    <span>{productReturn.productName}</span>
                  </div>
                  <div className="w-6/12 text-center">
                    <span>
                      {productReturn.quantity}{" "}
                      {productReturn.unitCode === "box"
                        ? ``
                        : `(${productReturn.unitCode})`}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="divider"></div>
            <div className="mt-2 flex items-center gap-2">
              <span>Refund:</span>
              <span className="text-xl font-medium">
                ${customerReturn.refund}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}
