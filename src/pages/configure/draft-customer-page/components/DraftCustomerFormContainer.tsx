import useFirstRender from "../../../../commons/hooks/first-render.hook";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import api from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import Alert from "../../../../components/Alert";
import DraftCustomerForm from "./DraftCustomerForm";

export default function DraftCustomerFormContainer() {
  const isFirstRender = useFirstRender();
  const params = useParams();
  const [reload, setReload] = useState(false);
  const [formState, setFormState] = useState({
    errorMessage: "",
    emptyMessage: "",
    loading: true,
  });
  const [dataState, setDataState] = useState({
    allProducts: [],
    editedProducts: [],
  });
  const [initialFields, setInitialFields] = useState({});

  useEffect(() => {
    const productPromise = api.get(`/products/all`);
    if (params.id) {
      // TODO: update customer
      const customerPromise = api.get(`/customers/all/${params.id}`);
      Promise.all([customerPromise, productPromise])
      .then((res) => {
        const customerRes = res[0].data;
        const editedProductsRes = [];
        const allProductsRes = res[1].data;
        const productFieldData = {};
        for (const product of allProductsRes) {
          const found = customerRes.customerProductTendencies.find(p => p.name === product.name);
          if (found) {
            productFieldData[`quantity${product.id}`] = found.quantity;
            editedProductsRes.push({
              id: product.id,
              name: product.name,
            });
          }
        }
        setInitialFields(prev => ({
          ...prev,
          name: customerRes.name,
          address: customerRes.address,
          phone: customerRes.phone,
          email: customerRes.email,
          presentative: customerRes.presentative,
          discontinued: customerRes.discontinued,
          ...productFieldData,
        }));
        setDataState(prev => ({
          ...prev, 
          editedProducts: editedProductsRes,
          allProducts: allProductsRes,
        })); 
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
      // create customer
      productPromise.then((res) => {
        const allProducts = res.data;
        const productFieldData = {};
        for (const product of allProducts) {
          productFieldData[`quantity${product.id}`] = 0;
        }
        setInitialFields(prev => ({
          ...prev,
          name: "",
          address: "",
          phone: "",
          email: "",
          presentative: "",
          discontinued: false,
          ...productFieldData,
        }));
        setDataState(prev => ({...prev, allProducts: allProducts}));
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

  return (
  <>
    <div className="flex flex-col items-center">
      {formState.loading ? (
      <Spinner></Spinner>            
      ) : (
      <div className="container w-11/12 sm:w-8/12 xl:w-6/12">
        {formState.errorMessage ? (
        <Alert message={formState.errorMessage} type="error"></Alert>
        ) : (
        <>
          {formState.emptyMessage ? (
          <Alert message={formState.emptyMessage} type="empty"></Alert>
          ) : (
          <>
            <div className="custom-card mb-12">
              <DraftCustomerForm
              editedId={params?.id ? params.id : null}
              editedProducts={(dataState.editedProducts?.length > 0) ? dataState.editedProducts : null}
              initialData={initialFields}
              allProducts={dataState.allProducts}
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