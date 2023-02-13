import { useEffect, useState } from "react";
import useFirstRender from "../../../../commons/hooks/first-render.hook";
import { ProductStockChangeReason } from "../../../../commons/product-stock-change-reason.enum";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import ProductStockForm from "./ProductStockForm";

export default function ProductStockFormContainer() {
  const isFirstRender = useFirstRender();
  const [reload, setReload] = useState(false);
  const [formState, setFormState] = useState({
    errorMessage: "",
    emptyMessage: "",
    loading: true,
  });
  const [initialFields, setInitialFields] = useState({});
  const [productStock, setProductStock] = useState([]);

  useEffect(() => {
    api
      .get(`/product-stock`)
      .then((res) => {
        if (res.data?.length === 0) {
          setFormState((prev) => ({
            ...prev,
            errorMessage: "",
            emptyMessage: "Such hollow, much empty...",
            loading: false,
          }));
        } else {
          const formFieldData = {};
          for (const s of res.data) {
            formFieldData[`quantity${s.id}`] = s.quantity;
          }
          setInitialFields((prev) => ({
            ...prev,
            reason: ProductStockChangeReason.DAMAGED,
            ...formFieldData,
          }));
          setProductStock(res.data);
          setFormState((prev) => ({
            ...prev,
            errorMessage: "",
            emptyMessage: "",
            loading: false,
          }));
        }
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFormState((prev) => ({
          ...prev,
          emptyMessage: "",
          errorMessage: error.message,
          loading: false,
        }));
      });
  }, [reload]);

  useEffect(() => {
    if (!isFirstRender) {
      setFormState((prev) => ({
        ...prev,
        errorMessage: "",
        emptyMessage: "",
        loading: false,
      }));
    }
  }, [initialFields]);

  const onClear = () => {
    setReload(!reload);
    setFormState((prev) => ({
      ...prev,
      erorrMessage: "",
      emptyMessage: "",
      loading: true,
    }));
  };

  if (formState.loading) return <Spinner></Spinner>;
  if (formState.errorMessage)
    return <Alert message={formState.errorMessage} type="error"></Alert>;
  if (formState.emptyMessage)
    return <Alert message={formState.emptyMessage} type="empty"></Alert>;

  return (
    <div className="custom-card mb-12">
      <ProductStockForm
        initialData={initialFields}
        stocks={productStock}
        onClear={onClear}
      />
    </div>
  );
}
