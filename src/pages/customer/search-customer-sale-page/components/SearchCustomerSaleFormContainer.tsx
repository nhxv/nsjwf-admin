import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import SearchCustomerSaleForm from "./SearchCustomerSaleForm";

export default function SearchCustomerSaleFormContainer() {
  const navigate = useNavigate();
  const [fetchData, setFetchData] = useState({
    products: [],
    customers: [],
    error: "",
    empty: "",
    loading: true,
  });

  useEffect(() => {
    const productPromise = api.get(`/products/all`);
    const customerPromise = api.get(`/customers/all`);

    Promise.all([productPromise, customerPromise])
      .then((res) => {
        const productRes = res[0];
        const customerRes = res[1];
        if (productRes?.data?.length === 0 || customerRes?.data?.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            error: "",
            empty: "Such hollow, much empty...",
            loading: false,
          }));
        } else {
          setFetchData((prev) => ({
            ...prev,
            products: productRes.data,
            customers: customerRes.data,
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
          products: [],
          customers: [],
          error: error.message,
          empty: "",
          loading: false,
        }));

        if (error.status === 401) {
          handleTokenExpire(navigate, setFetchData);
        }
      });
  }, []);

  if (fetchData.loading) return <Spinner></Spinner>;
  if (fetchData.error)
    return <Alert message={fetchData.error} type="error"></Alert>;
  if (fetchData.empty)
    return <Alert message={fetchData.empty} type="empty"></Alert>;

  return (
    <div className="mb-8 flex flex-col items-center">
      <SearchCustomerSaleForm
        products={fetchData.products}
        customers={fetchData.customers}
      />
    </div>
  );
}
