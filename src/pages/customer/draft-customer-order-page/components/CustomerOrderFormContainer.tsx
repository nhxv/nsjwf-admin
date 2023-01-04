import { useState, useEffect, useMemo } from "react";
import CustomerOrderForm from "./CustomerOrderForm";
import api from "../../../../stores/api";
import { BiError, BiBot } from "react-icons/bi";
import Spinner from "../../../../components/Spinner";
import useFirstRender from "../../../../commons/hooks/first-render.hook";
import { useParams } from "react-router-dom";
import { OrderStatus } from "../../../../commons/order-status.enum";
import { convertTime } from "../../../../commons/time.util";
import Alert from "../../../../components/Alert";

export default function CustomerOrderFormContainer() {
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
    employees: [],
    prices: [],
  });
  const total = useMemo(() => {
    if (dataState.prices.length > 0) {
      return +dataState.prices.reduce((prev, current) => prev + current[0]*current[1], 0).toFixed(2);
    } else return 0;
  }, [dataState.prices]);

  useEffect(() => {
    const productPromise = api.get(`/products/all`);
    const customerPromise = api.get(`/customers/all`);
    const employeePromise = api.get(`/accounts/employees`);
    if (params.code) {
      // edit mode
      const orderPromise = api.get(`/customer-orders/${params.code}`);
      Promise.all([productPromise, customerPromise, employeePromise, orderPromise])
      .then((res) => {
        const productRes = res[0];
        const customerRes = res[1];
        const employeeRes = res[2];
        const orderRes = res[3];        
        if (
          !productRes ||
          productRes.data.length === 0 ||
          !customerRes ||
          customerRes.data.length === 0 ||
          !employeeRes ||
          employeeRes.data.length === 0 ||
          !orderRes.data
        ) {
            setFormState(prev => (
            {...prev, emptyMessage: "Such hollow, much empty...", loading: false}
            ));
        } else {
          // setup initial field values
          const updatedPrices = [];
          const productFieldData = {};
          const productOrders = orderRes.data.productCustomerOrders;
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
              employeeName: orderRes.data.assign_to,
              status: orderRes.data.status, 
              isTest: orderRes.data.is_test,
              code: orderRes.data.code,
              expectedAt: convertTime(new Date(orderRes.data.expected_at)),
              ...productFieldData
            }
          ));
          setDataState(prev => (
            {
              ...prev,
              products: productRes.data,
              customers: customerRes.data,
              employees: employeeRes.data,
              prices: updatedPrices
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
      Promise.all([productPromise, customerPromise, employeePromise])
      .then((res) => {
      const productRes = res[0];
      const customerRes = res[1];
      const employeeRes = res[2];
      if (
        !productRes ||
        productRes.data.length === 0 ||
        !customerRes || 
        customerRes.data?.length === 0 ||
        !employeeRes ||
        employeeRes.data?.length === 0
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
            customerName: ``,
            employeeName: employeeRes.data[0].nickname,
            status: OrderStatus.PICKING, 
            isTest: true,
            expectedAt: convertTime(nextDay),
            ...productFieldData
          }
        ));
        setDataState(prev => ({
          ...prev,
          products: productRes.data,
          customers: customerRes.data,
          employees: employeeRes.data,
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
          <div className="bg-base-100 p-6 rounded-box shadow-md mb-12">
            <CustomerOrderForm
            edit={!!params.code} 
            initialData={initialFields} 
            customers={dataState.customers} 
            products={dataState.products}
            employees={dataState.employees}
            updatePrice={updatePrice}
            total={total}
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