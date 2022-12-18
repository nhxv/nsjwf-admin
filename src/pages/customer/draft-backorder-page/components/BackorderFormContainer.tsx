import { useState, useEffect, useMemo } from "react";
import BackorderForm from "./BackorderForm";
import api from "../../../../stores/api";
import { BiError, BiBot } from "react-icons/bi";
import Spinner from "../../../../components/Spinner";
import useFirstRender from "../../../../commons/hooks/first-render.hook";
import { useParams } from "react-router-dom";
import { convertTime } from "../../../../commons/time.util";

export default function BackorderFormContainer() {
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
    products: [],
    customers: [],
    prices: [],
  });
  const total = useMemo(() => {
    if (dataState.prices.length > 0) {
      return dataState.prices.reduce((prev, current) => prev + current[0]*current[1], 0);
    } else return 0;
  }, [dataState.prices]);

  useEffect(() => {
    const productPromise = api.get(`/products/all`);
    const customerPromise = api.get(`/customers/all`);
    if (params.id) {
      // edit mode
      const orderPromise = api.get(`/backorders/${params.id}`);
      Promise.all([productPromise, customerPromise, orderPromise])
      .then((res) => {
        const productRes = res[0];
        const customerRes = res[1];
        const orderRes = res[2];        
        if (
          !productRes ||
          productRes.data.length === 0 ||
          !customerRes || 
          customerRes.data.length === 0 ||
          !orderRes.data
        ) {
            setFormState(prev => (
            {...prev, emptyMessage: "Such hollow, much empty...", loading: false}
            ));
        } else {
          // setup initial field values
          const updatedPrices = [];
          const productFieldData = {};
          const productOrders = orderRes.data.productBackorders;
          for (let i = 0; i < productRes.data.length; i++) {
            const productOrder = productOrders.find(po => po.product_name === productRes.data[i].name);
            if (productOrder) {
              productFieldData[`quantity${i}`] = productOrder.quantity;
              productFieldData[`price${i}`] = productOrder.unit_price;
            } else {
              productFieldData[`quantity${i}`] = 0;
              productFieldData[`price${i}`] = 0;
            }
            updatedPrices.push([productFieldData[`quantity${i}`], productFieldData[`price${i}`]]);
          }
          setInitialFields(prev => (
            {
              ...prev, 
              customerName: orderRes.data.customer_name,
              isArchived: orderRes.data.is_archived, 
              isTest: orderRes.data.is_test,
              id: orderRes.data.id,
              expectedAt: convertTime(new Date(orderRes.data.expected_at)), 
              ...productFieldData,
            }
          ));
          setDataState(prev => (
            {
              ...prev,
              products: productRes.data,
              customers: customerRes.data,
              prices: updatedPrices,
            }
          ));            
          }
        })
        .catch((e) => {
          const error = JSON.parse(JSON.stringify(
            e.response ? e.response.data.error : e
          ));
          setFormState(prev => (
            {...prev, errorMessage: error.message, loading: false}
          ));        
        });
    } else {
      // create mode
      Promise.all([productPromise, customerPromise])
      .then((res) => {
      const productRes = res[0];
      const customerRes = res[1];
      if (
        !productRes ||
        productRes.data.length === 0 ||
        !customerRes || 
        customerRes.data?.length === 0
      ) {
        setFormState(prev => (
        {...prev, emptyMessage: "Such hollow, much empty...", loading: false}
        ));
      } else {
        // setup initial field values
        let updatedPrices = [];
        const productFieldData = {};
        for (let i = 0; i < productRes.data.length; i++) {
          productFieldData[`quantity${i}`] = 0;
          productFieldData[`price${i}`] = 0;
          updatedPrices.push([productFieldData[`quantity${i}`], productFieldData[`price${i}`]]);
        }
        const today = new Date();
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + 1);
        setInitialFields(prev => (
          {
            ...prev, 
            customerName: customerRes.data[0].name,
            isArchived: false, 
            isTest: true,
            expectedAt: convertTime(nextDay),
            ...productFieldData
          }
        ));
        setDataState(prev => ({
          ...prev,
          products: productRes.data,
          customers: customerRes.data,
          prices: updatedPrices}));  
      }
      })
      .catch((e) => {
        const error = JSON.parse(JSON.stringify(
          e.response ? e.response.data.error : e
        ));
        setFormState(prev => (
          {...prev, errorMessage: error.message, loading: false}
        ));
      });
    }

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
    } else if (inputId.includes("price")) {
      const index = +inputId.replace("price", "");
      updatedPrices[index][1] = +e.target.value;
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
              <BackorderForm
              edit={!!params.id} 
              initialData={initialFields} 
              customers={dataState.customers} 
              products={dataState.products}
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