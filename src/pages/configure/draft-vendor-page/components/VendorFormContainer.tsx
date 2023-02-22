import useFirstRender from "../../../../commons/hooks/first-render.hook";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import api from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import Alert from "../../../../components/Alert";
import VendorForm from "./VendorForm";

export default function VendorFormContainer() {
  const isFirstRender = useFirstRender();
  const params = useParams();
  const [reload, setReload] = useState(false);
  const [fetchData, setFetchData] = useState({
    allProducts: [],
    editedProducts: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [initialFields, setInitialFields] = useState({});

  useEffect(() => {
    const productPromise = api.get(`/products/active`);
    if (params.id) {
      const vendorPromise = api.get(`/vendors/active/${params.id}`);
      Promise.all([vendorPromise, productPromise])
        .then((res) => {
          const vendorRes = res[0].data;
          const editedProductsRes = [];
          const allProductsRes = res[1].data;
          const productFieldData = {};
          for (const product of allProductsRes) {
            const found = vendorRes.vendorProductTendencies.find(
              (p) => p.name === product.name
            );
            if (found) {
              productFieldData[`quantity${product.id}`] = found.quantity;
              productFieldData[`unit${product.id}`] = found.unit_code.split("_")[1];
              editedProductsRes.push({
                id: product.id,
                name: product.name,
                units: product.units,
              });
            }
          }
          setInitialFields((prev) => ({
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
          setFetchData((prev) => ({
            ...prev,
            allProducts: allProductsRes,
            editedProducts: editedProductsRes,
            error: "",
            empty: "",
            loading: false,
          }));
        })
        .catch((e) => {
          const error = JSON.parse(
            JSON.stringify(e.response ? e.response.data.error : e)
          );
          setFetchData((prev) => ({
            ...prev,
            allProducts: [],
            editedProducts: [],
            empty: "",
            error: error.message,
            loading: false,
          }));
        });
    } else {
      // create vendor
      productPromise
        .then((res) => {
          const allProducts = res.data;
          const productFieldData = {};
          for (const product of allProducts) {
            productFieldData[`quantity${product.id}`] = 0;
            productFieldData[`unit${product.id}`] = "BOX";
          }
          setInitialFields((prev) => ({
            ...prev,
            name: "",
            address: "",
            phone: "",
            email: "",
            presentative: "",
            discontinued: false,
            ...productFieldData,
          }));
          setFetchData((prev) => ({ 
            ...prev, 
            allProducts: allProducts,
            editedProducts: [],
            error: "",
            empty: "",
            loading: false, 
          }));
        })
        .catch((e) => {
          const error = JSON.parse(
            JSON.stringify(e.response ? e.response.data.error : e)
          );
          setFetchData((prev) => ({
            ...prev,
            allProducts: [],
            editedProducts: [],
            error: error.message,
            empty: "",
            loading: false,
          }));
        });
    }
  }, [reload, params]);

  useEffect(() => {
    if (!isFirstRender) {
      setFetchData((prev) => ({
        ...prev,
        error: "",
        empty: "",
        loading: false,
      }));
    }
  }, [initialFields]);

  const onClear = () => {
    setReload(!reload);
    setFetchData((prev) => ({
      ...prev,
      allProducts: [],
      editedProducts: [],
      error: "",
      empty: "",
      loading: true,
    }));
  };

  if (fetchData.loading) return <Spinner></Spinner>;
  if (fetchData.error)
    return <Alert message={fetchData.error} type="error"></Alert>;
  if (fetchData.empty)
    return <Alert message={fetchData.empty} type="empty"></Alert>;

  return (
    <div className="custom-card mb-12">
      <VendorForm
        editedId={params?.id ? params.id : null}
        editedProducts={
          fetchData.editedProducts?.length > 0 ? fetchData.editedProducts : null
        }
        initialData={initialFields}
        allProducts={fetchData.allProducts}
        onClear={onClear}
      />
    </div>
  );
}
