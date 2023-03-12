import { useEffect, useState } from "react";
import { StockChangeReason } from "../../../../commons/enums/stock-change-reason.enum";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
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
    api.get(`/stock/active`)
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
          const stockFieldData = {};
          for (const product of res.data) {
            stockFieldData[`quantity${product.id}`] = product.stock.quantity;
            stockFieldData[`unit${product.id}`] = "BOX";
          }
          setInitialFields((prev) => ({
            ...prev,
            reason: StockChangeReason.DAMAGED,
            ...stockFieldData,
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
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
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
  if (fetchData.error)
    return <Alert message={fetchData.error} type="error"></Alert>;
  if (fetchData.empty)
    return <Alert message={fetchData.empty} type="empty"></Alert>;

  return (
    <div className="custom-card mb-12">
      <ProductStockForm
        initialData={initialFields}
        products={fetchData.products}
        onClear={onClear}
      />
    </div>
  );
}
