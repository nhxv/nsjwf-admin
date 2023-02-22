import { useEffect, useState } from "react";
import useFirstRender from "../../../../commons/hooks/first-render.hook";
import { ProductStockChangeReason } from "../../../../commons/enums/stock-change-reason.enum";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import ProductStockForm from "./StockForm";

export default function StockFormContainer() {
  const isFirstRender = useFirstRender();
  const [reload, setReload] = useState(false);
  const [fetchData, setFetchData] = useState({
    stock: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [initialFields, setInitialFields] = useState({});

  useEffect(() => {
    api
      .get(`/stock`)
      .then((res) => {
        if (res.data?.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            stock: [],
            error: "",
            empty: "Such hollow, much empty...",
            loading: false,
          }));
        } else {
          const stockFieldData = {};
          for (const s of res.data) {
            stockFieldData[`quantity${s.id}`] = s.quantity;
            stockFieldData[`unit${s.id}`] = "BOX";
          }
          setInitialFields((prev) => ({
            ...prev,
            reason: ProductStockChangeReason.DAMAGED,
            ...stockFieldData,
          }));
          setFetchData((prev) => ({
            ...prev,
            stock: res.data,
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
          stock: [],
          empty: "",
          error: error.message,
          loading: false,
        }));
      });
  }, [reload]);

  useEffect(() => {
    if (!isFirstRender) {
      setFetchData((prev) => ({
        ...prev,
        error: "",
        empty: "",
        loading: false,
      }));
    }
  }, [initialFields]);

  const onClear = () => {
    setReload(!reload);
    setFetchData((prev) => ({
      ...prev,
      stock: [],
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
        stock={fetchData.stock}
        onClear={onClear}
      />
    </div>
  );
}
