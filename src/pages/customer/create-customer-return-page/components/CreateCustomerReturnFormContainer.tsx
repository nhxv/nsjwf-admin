import useFirstRender from "../../../../commons/hooks/first-render.hook";
import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import api from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import { BiError, BiBot } from "react-icons/bi";
import CreateCustomerReturnForm from "./CreateCustomerReturnForm";

export default function CreateCustomerReturnFormContainer({}) {
  const isFirstRender = useFirstRender();
  const params = useParams();
  const [reload, setReload] = useState(false);
  const [formState, setFormState] = useState({
    errorMessage: "",
    emptyMessage: "",
    loading: true,
  });
  const [initialFields, setInitialFields] = useState({});
  const [dataState, setDataState] = useState({
    sold: null,
    products: [],
    prices: [],
  });
  const total = useMemo(() => {
    if (dataState.prices.length > 0) {
      return dataState.prices.reduce((prev, current) => prev + current[0]*current[1], 0);
    } else return 0;
  }, [dataState.prices]);

  useEffect(() => {
    api.get(`/customer-sale-returns/${params.code}`)
    .then((res) => {
      const saleReturn = res.data;
      const updatedPrices = [];
      const productFieldData = {};
      for (let i = 0; i < saleReturn.productCustomerSaleReturns.length; i++) {
        productFieldData[`quantity${i}`] = saleReturn.productCustomerSaleReturns[i].quantity;
        updatedPrices.push([productFieldData[`quantity${i}`], saleReturn.productCustomerSaleReturns[i].unit_price]);
      }
      setInitialFields(prev => (
        {
          ...prev, 
          customerName: saleReturn.customer_name,
          orderCode: saleReturn.sale_code,
          ...productFieldData
        }
      ));
      setDataState(prev => (
        {
          ...prev, 
          products: saleReturn.productCustomerSaleReturns, 
          sold: saleReturn, 
          prices: updatedPrices
        }
      ))  
    })
    .catch((e) => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setFormState(prev => (
        {...prev, errorMessage: error.message, loading: false}
      )); 
    });
  }, [reload, params]);

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

  const updatePrice = (e, inputId: string) => {
    let updatedPrices = [...dataState.prices];
    if (inputId.includes("quantity")) {
      const index = +inputId.replace("quantity", "");
      updatedPrices[index][0] = +e.target.value;
    }
    setDataState(prev => ({...prev, prices: updatedPrices}));
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
        {formState.errorMessage ? (
        <>
          <div className="w-11/12 sm:w-8/12 md:w-6/12 alert alert-error text-red-700 flex justify-center">
            <div>
              <BiError className="flex-shrink-0 w-6 h-6"></BiError>
              <span>{formState.errorMessage}</span>
            </div>
          </div>           
        </>
        ) : (
        <>
          {formState.emptyMessage ? (
          <>
            <div className="w-11/12 sm:w-8/12 md:w-6/12 alert bg-gray-300 text-black flex justify-center">
              <div>
                <BiBot className="flex-shrink-0 w-6 h-6"></BiBot>
                <span>{formState.emptyMessage}</span>
              </div>
            </div>             
          </>
          ) : (
          <>
            <div className="w-11/12 sm:w-8/12 md:w-6/12 bg-white p-6 rounded-box shadow-md mb-12">
              <CreateCustomerReturnForm
              initialData={initialFields}
              products={dataState.products}
              sold={dataState.sold} 
              updatePrice={updatePrice}
              total={total}
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