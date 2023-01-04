import useFirstRender from "../../../../commons/hooks/first-render.hook";
import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import api from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import { BiError, BiBot } from "react-icons/bi";
import CreateVendorReturnForm from "./CreateVendorReturnForm";
import Alert from "../../../../components/Alert";

export default function CreateVendorReturnFormContainer({}) {
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
    api.get(`/vendor-sale-returns/${params.code}`)
    .then((res) => {
      const saleReturn = res.data;
      const updatedPrices = [];
      const productFieldData = {};
      for (let i = 0; i < saleReturn.productVendorSaleReturns.length; i++) {
        productFieldData[`quantity${i}`] = saleReturn.productVendorSaleReturns[i].quantity;
        updatedPrices.push([productFieldData[`quantity${i}`], saleReturn.productVendorSaleReturns[i].unit_price]);
      }
      setInitialFields(prev => (
        {
          ...prev, 
          vendorName: saleReturn.vendor_name,
          orderCode: saleReturn.sale_code,
          ...productFieldData
        }
      ));
      setDataState(prev => (
        {
          ...prev, 
          products: saleReturn.productVendorSaleReturns, 
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
      <Spinner></Spinner>            
      ) : (
      <div className="w-11/12 sm:w-8/12 md:w-6/12">
        {formState.errorMessage ? (
        <Alert message={formState.errorMessage} type="error"></Alert>
        ) : (
        <>
          {formState.emptyMessage ? (
          <Alert message={formState.emptyMessage} type="empty"></Alert>
          ) : (
          <>
            <div className=" bg-base-100 p-6 rounded-box shadow-md mb-12">
              <CreateVendorReturnForm
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
      </div>
      )}
    </div>  
  </>
  )  
}