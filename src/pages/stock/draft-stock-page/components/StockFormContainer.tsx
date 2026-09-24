import { useEffect, useState } from "react";
import { StockChangeReason } from "../../../../commons/enums/stock-change-reason.enum";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api, { getApiError } from "../../../../stores/api";
import ProductStockForm from "./StockForm";

export default function StockFormContainer() {
  const [reload, setReload] = useState(false);
  const [fetchData, setFetchData] = useState({
    products: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [initialFields, setInitialFields] = useState({});

  useEffect(() => {
    api
      .get(`/stock`)
      .then((res) => {
        if (res?.data?.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            products: [],
            error: "",
            empty: "Such hollow, much empty...",
            loading: false,
          }));
        } else {
          setInitialFields((prev) => ({
            ...prev,
            reason: StockChangeReason.DAMAGED,
            stock: [],
          }));
          setFetchData((prev) => ({
            ...prev,
            products: res.data,
            error: "",
            empty: "",
            loading: false,
          }));
        }
      })
      .catch((e) => {
        const error = getApiError(e);
        setFetchData((prev) => ({
          ...prev,
          products: [],
          empty: "",
          error: error.message,
          loading: false,
        }));
      });
  }, [reload]);

  const onClear = () => {
    setReload(!reload);
    setFetchData((prev) => ({
      ...prev,
      products: [],
      error: "",
      empty: "",
      loading: true,
    }));
  };

  if (fetchData.loading) return <Spinner></Spinner>;
  if (fetchData.error) return <Alert message={fetchData.error} type="error"></Alert>;
  if (fetchData.empty) return <Alert message={fetchData.empty} type="empty"></Alert>;

  return (
    <div className="custom-card mb-12">
      <ProductStockForm initialData={initialFields} products={fetchData.products} onClear={onClear} />
    </div>
  );
}
