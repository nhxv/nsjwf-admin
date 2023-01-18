import useFirstRender from "../../../../commons/hooks/first-render.hook";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import api from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import Alert from "../../../../components/Alert";
import DraftVendorForm from "./DraftVendorForm";

export default function DraftVendorFormContainer() {
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
      // TODO: update vendor
      const vendorPromise = api.get(`/vendors/all/${params.id}`);
      Promise.all([vendorPromise, productPromise])
      .then((res) => {
        const vendorRes = res[0].data;
        const editedProductsRes = [];
        const allProductsRes = res[1].data;
        const productFieldData = {};
        for (const product of allProductsRes) {
          const found = vendorRes.vendorProductTendencies.find(p => p.name === product.name);
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
          id: vendorRes.id,
          name: vendorRes.name,
          address: vendorRes.address,
          phone: vendorRes.phone,
          email: vendorRes.email,
          presentative: vendorRes.presentative,
          discontinued: vendorRes.discontinued,
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
          {...prev, emptyMessage: "", errorMessage: error.message, loading: false}
        )); 
      });
    } else {
      // create vendor
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
          {...prev, errorMessage: error.message, emptyMessage: "", loading: false}
        )); 
      });
    }
  }, [reload, params]);

  useEffect(() => {
    if (!isFirstRender) {
      setFormState(prev => (
        {...prev, errorMessage: "", emptyMessage: "", loading: false}
      ));
    }
  }, [initialFields]);
  
  const onClear = () => {
    setReload(!reload);
    setFormState(prev => ({...prev, errorMessage: "", emptyMessage: "", loading: true}));
  }

  if (formState.loading) return <Spinner></Spinner>
  if (formState.errorMessage) return <Alert message={formState.errorMessage} type="error"></Alert>
  if (formState.emptyMessage) return <Alert message={formState.emptyMessage} type="empty"></Alert>

  return (
    <div className="custom-card mb-12">
      <DraftVendorForm
      edit={!!params?.id}
      editedProducts={(dataState.editedProducts?.length > 0) ? dataState.editedProducts : null}
      initialData={initialFields}
      allProducts={dataState.allProducts}
      onClear={onClear} />
    </div> 
  )
}