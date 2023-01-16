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
    editedProducts: [],
    allProducts: [],
    customers: [],
    employees: [],
    prices: [],
  });
  const total = useMemo(() => {
    if (dataState.prices.length > 0) {
      return +dataState.prices.reduce((prev, current) => prev + current.quantity*current.price, 0).toFixed(2);
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
          const editedProductsRes = [];
          const allProductsRes = productRes.data;
          const productFieldData = {};
          const productOrders = orderRes.data.productCustomerOrders;
          for (const product of allProductsRes) {
            const productOrder = productOrders.find(po => po.product_name === product.name);
            if (productOrder) {
              productFieldData[`quantity${product.id}`] = productOrder.quantity;
              productFieldData[`price${product.id}`] = productOrder.unit_price;
              updatedPrices.push({
                id: product.id,
                quantity: productFieldData[`quantity${product.id}`], 
                price: productFieldData[`price${product.id}`],
              });
              editedProductsRes.push({
                id: product.id,
                name: product.name,
              });
            }
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
              editedProducts: editedProductsRes,
              allProducts: allProductsRes,
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
        for (const product of productRes.data) {
          productFieldData[`quantity${product.id}`] = 0;
          productFieldData[`price${product.id}`] = 0;
          updatedPrices.push({
            id: product.id,
            quantity: productFieldData[`quantity${product.id}`], 
            price: productFieldData[`price${product.id}`],
          });
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
          allProducts: productRes.data,
          customers: customerRes.data,
          employees: employeeRes.data,
          prices: updatedPrices
        }));  
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

  const updatePrice = (value: number, inputId: string) => {
    let updatedPrices = [...dataState.prices];
    if (inputId.includes("quantity")) {
      const id = +inputId.replace("quantity", "");
      const index = updatedPrices.findIndex(p => p.id === id);
      updatedPrices[index].quantity = value;
    } else if (inputId.includes("price")) {
      const id = +inputId.replace("price", "");
      const index = updatedPrices.findIndex(p => p.id === id);
      updatedPrices[index].price = value;
    } else if (inputId.includes("remove")) {
      const id = +inputId.replace("remove", "");
      const index = updatedPrices.findIndex(p => p.id === id);
      updatedPrices[index].quantity = 0;
      updatedPrices[index].price = 0;    
    }
    setDataState(prev => ({...prev, prices: updatedPrices}));
  }

  const loadTemplate = async (customerName: string) => {
    if (!params.code) {
      // load template when create
      try {
        const response = await api.get(`/customers/tendency/${customerName}`);
        return response.data.customerProductTendencies;
      } catch (e) {
        const error = JSON.parse(JSON.stringify(
          e.response ? e.response.data.error : e
        ));
        setFormState(prev => (
          {...prev, errorMessage: error.message, loading: false}
        ));
      }
    }
  }

  return (
  <>
    <div className="flex flex-col items-center">
      {formState.loading ? (
      <Spinner></Spinner>
      ) : (
      <div className="w-11/12 sm:w-8/12 xl:w-6/12">
        {formState.errorMessage ? (
        <Alert message={formState.errorMessage} type="error"></Alert>
        ) : (
        <>
          {formState.emptyMessage ? (
          <Alert message={formState.emptyMessage} type="empty"></Alert>
          ) : (
          <div className="custom-card mb-12">
            <CustomerOrderForm
            edit={!!params.code} 
            initialData={initialFields} 
            customers={dataState.customers} 
            editedProducts={(dataState.editedProducts?.length > 0) ? dataState.editedProducts : null} 
            allProducts={dataState.allProducts}
            employees={dataState.employees}
            updatePrice={updatePrice}
            total={total}
            loadTemplate={loadTemplate}
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