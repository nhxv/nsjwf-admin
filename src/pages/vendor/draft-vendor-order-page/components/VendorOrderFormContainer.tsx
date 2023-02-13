import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useFirstRender from "../../../../commons/hooks/first-render.hook";
import { OrderStatus } from "../../../../commons/order-status.enum";
import { convertTime } from "../../../../commons/time.util";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import VendorOrderForm from "./VendorOrderForm";

export default function VendorOrderFormContainer() {
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
    vendors: [],
    prices: [],
  });
  const total = useMemo(() => {
    if (dataState.prices.length > 0) {
      return +dataState.prices.reduce((prev, current) => prev + current.quantity*current.price, 0).toFixed(2);
    } else return 0;
  }, [dataState.prices]);

  useEffect(() => {
    const productPromise = api.get(`/products/active`);
    const vendorPromise = api.get(`/vendors/active`);
    if (params.code) {
      // edit mode
      const orderPromise = api.get(`/vendor-orders/${params.code}`);
      Promise.all([productPromise, vendorPromise, orderPromise])
      .then((res) => {
        const productRes = res[0];
        const vendorRes = res[1];
        const orderRes = res[2];        
        if (
          !productRes ||
          productRes.data.length === 0 ||
          !vendorRes || 
          vendorRes.data.length === 0 ||
          !orderRes.data
        ) {
            setFormState(prev => ({
              ...prev, 
              emptyMessage: "Such hollow, much empty...", 
              errorMessage: "", 
              loading: false
            }));
        } else {
          // setup initial field values
          const updatedPrices = [];
          const editedProductsRes = [];
          const allProductsRes = productRes.data;
          const productFieldData = {};
          const productOrders = orderRes.data.productVendorOrders;
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
              vendorName: orderRes.data.vendor_name,
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
              vendors: vendorRes.data,
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
            {...prev, errorMessage: error.message, emptyMessage: "", loading: false}
          ));        
        });
    } else {
      // create mode
      Promise.all([productPromise, vendorPromise])
      .then((res) => {
      const productRes = res[0];
      const vendorRes = res[1];
      if (
        !productRes ||
        productRes.data.length === 0 ||
        !vendorRes || 
        vendorRes.data?.length === 0
      ) {
        setFormState(prev => (
        {...prev, emptyMessage: "Such hollow, much empty...", errorMessage: "", loading: false}
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
            vendorName: ``,
            status: OrderStatus.SHIPPING, 
            isTest: false,
            expectedAt: convertTime(nextDay), 
            ...productFieldData
          }
        ));
        setDataState(prev => ({
          ...prev,
          allProducts: productRes.data,
          vendors: vendorRes.data,
          prices: updatedPrices
        }));  
      }
      })
      .catch((e) => {
        const error = JSON.parse(JSON.stringify(
          e.response ? e.response.data.error : e
        ));
        setFormState(prev => (
          {...prev, errorMessage: error.message, emptyMessage: "", loading: false}
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
    setFormState(prev => ({...prev, errorMessage: "", emptyMessage: "", loading: true}));
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

  const loadTemplate = async (vendorName: string) => {
    if (!params.code) {
      // load template when create
      try {
        const response = await api.get(`/vendors/tendency/${vendorName}`);
        return response.data.vendorProductTendencies;
      } catch (e) {
        const error = JSON.parse(JSON.stringify(
          e.response ? e.response.data.error : e
        ));
        setFormState(prev => (
          {...prev, errorMessage: error.message, emptyMessage: "", loading: false}
        ));
      }
    }
  }

  if (formState.loading) return <Spinner></Spinner>
  if (formState.errorMessage) return <Alert message={formState.errorMessage} type="error"></Alert>
  if (formState.emptyMessage) return <Alert message={formState.emptyMessage} type="empty"></Alert>

  return (
    <div className="custom-card mb-12">
      <VendorOrderForm
      edit={!!params.code} 
      initialData={initialFields} 
      vendors={dataState.vendors}
      editedProducts={(dataState.editedProducts?.length > 0) ? dataState.editedProducts : null} 
      allProducts={dataState.allProducts}
      updatePrice={updatePrice}
      total={total}
      loadTemplate={loadTemplate}
      onClear={onClear} />
    </div> 
  )
}