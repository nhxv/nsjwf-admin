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
    error: "",
    empty: "",
    loading: true,
  });
  const [initialFields, setInitialFields] = useState({});
  const [productStock, setProductStock] = useState([]);

  useEffect(() => {
    api.get(`/product-stock`)
    .then((res) => {
      if (res.data?.length === 0) {
        setFormState(prev => ({...prev, error: "", empty: "Such hollow, much empty...", loading: false}));
      } else {
        const formFieldData = {};
        for (const s of res.data) {
          formFieldData[`stock${s.id}`] = s.quantity;
        }
        setInitialFields(prev => ({
          ...prev, 
          reason: ProductStockChangeReason.DAMAGED, 
          ...formFieldData
        }));
        setProductStock(res.data);
      }
    })
    .catch ((e) => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setFormState(prev => (
        {...prev, error: error.message, loading: false}
      ));
    });
  }, [reload]);

  useEffect(() => {
    if (!isFirstRender) {
      setFormState(prev => (
        {...prev, loading: false}
      ));
    }
  }, [initialFields]);

  const onClear = () => {
    setReload(!reload);
    setFormState(prev => ({...prev, loading: true}));
  }

  return (
  <>
    <div className="flex flex-col items-center">
      {formState.loading ? (
      <Spinner></Spinner>
      ) : (
      <div className="container w-11/12 sm:w-8/12 xl:w-6/12">
        {formState.error ? (
        <Alert message={formState.error} type="error"></Alert>
        ) : (
        <>
          {formState.empty ? (
          <Alert message={formState.empty} type="empty"></Alert>
          ) : (
          <div className="custom-card mb-12">
            <ProductStockForm 
            initialData={initialFields}
            stocks={productStock} 
            onClear={onClear} />
          </div>   
          )}
        </>
        )}
      </div>
      )}
    </div>  
  </>  
  )
}