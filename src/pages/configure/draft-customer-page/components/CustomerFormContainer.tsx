import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import CustomerForm from "./CustomerForm";

export default function CustomerFormContainer() {
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
      const customerPromise = api.get(`/customers/active/${params.id}`);
      Promise.all([customerPromise, productPromise])
        .then((res) => {
          const customerRes = res[0].data;
          const editedProductsRes = [];
          const allProductsRes = res[1].data;
          const productFieldData = {};
          for (const product of allProductsRes) {
            const found = customerRes.customerProductTendencies.find(
              (p) => p.name === product.name
            );
            if (found) {
              productFieldData[`quantity${product.id}`] = found.quantity;
              productFieldData[`unit${product.id}`] =
                found.unit_code.split("_")[1];
              editedProductsRes.push({
                id: product.id,
                name: product.name,
                units: product.units,
              });
            }
          }
          setInitialFields((prev) => ({
            ...prev,
            name: customerRes.name,
            address: customerRes.address,
            phone: customerRes.phone,
            email: customerRes.email,
            presentative: customerRes.presentative,
            discontinued: customerRes.discontinued,
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
      // create customer
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
      <CustomerForm
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
