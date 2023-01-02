import { useState, useEffect } from "react";
import Spinner from "../../../../components/Spinner";
import { BiError, BiBot } from "react-icons/bi";
import api from "../../../../stores/api";
import useFirstRender from "../../../../commons/hooks/first-render.hook";
import ProductStockForm from "./ProductStockForm";
import { ProductStockChangeReason } from "../../../../commons/product-stock-change-reason.enum";

export default function ProductStockFormContainer() {
  const isFirstRender = useFirstRender();
  const [reload, setReload] = useState(false);
  const [formState, setFormState] = useState({
    error: "",
    empty: "",
    loading: true,
  });

  const [initialFields, setInitialFields] = useState({});
  const [productStock, setProductStock] = useState<[]>([]);

  useEffect(() => {
    api.get(`/product-stock`)
    .then((res) => {
      setProductStock(res.data);
      if (res.data.length === 0) {
        setFormState(prev => (
          {...prev, empty: "Such hollow, much empty...", loading: false}
        ));
      } else {
        const formFieldData = {};
        for (const s of res.data) {
          formFieldData[`stock${s.id}`] = s.quantity;
        }
        setInitialFields(prev => ({...prev, reason: ProductStockChangeReason.DAMAGED, ...formFieldData}));
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
      <>
        <div className="flex justify-center">
          <Spinner></Spinner>
        </div>              
      </>
      ) : (
      <>
        {formState.error ? (
        <>
          <div className="w-11/12 sm:w-8/12 md:w-6/12 alert alert-error text-red-700 flex justify-center">
            <div>
              <BiError className="flex-shrink-0 w-6 h-6"></BiError>
              <span>{formState.error}</span>
            </div>
          </div>           
        </>
        ) : (
        <>
          {formState.empty ? (
          <>
            <div className="w-11/12 sm:w-8/12 md:w-6/12 alert bg-gray-300 text-black flex justify-center">
              <div>
                <BiBot className="flex-shrink-0 w-6 h-6"></BiBot>
                <span>{formState.empty}</span>
              </div>
            </div>             
          </>
          ) : (
          <>
            <div className="w-11/12 sm:w-8/12 md:w-6/12 bg-white p-6 rounded-box shadow-md mb-12">
              <ProductStockForm 
              initialData={initialFields}
              stocks={productStock} 
              onClear={onClear} />
            </div>   
          </>
          )}
        </>
        )}
      </>
      )}
    </div>  
  </>  
  )
}