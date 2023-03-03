import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { parseFraction } from "../../../../commons/utils/fraction.util";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import CreateCustomerReturnForm from "./CreateCustomerReturnForm";

export default function CreateCustomerReturnFormContainer({}) {
  const params = useParams();
  const [reload, setReload] = useState(false);
  const [fetchData, setFetchData] = useState({
    sold: null,
    products: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [initialFields, setInitialFields] = useState({});

  useEffect(() => {
    const saleReturnPromise = api.get(`/customer-sale-returns/${params.code}`);
    const productPromise = api.get(`/products/active`);
    Promise.all([saleReturnPromise, productPromise])
      .then((res) => {
        const saleReturnRes = res[0].data;
        const allProductsRes = res[1].data;
        const productFieldData = {};
        const allProductReturns = [];
        for (const product of allProductsRes) {
          const productReturn = saleReturnRes.productCustomerSaleReturns.find(
            (pr) => pr.product_name === product.name
          );
          if (productReturn) {
            productFieldData[`quantity${product.id}`] = parseFraction(
              productReturn.quantity
            );
            productFieldData[`unit${product.id}`] =
              productReturn.unit_code.split("_")[1];
            allProductReturns.push({
              id: product.id, // to query unit
              name: productReturn.product_name,
              quantity: productReturn.quantity,
              unit_code: productReturn.unit_code,
              units: product.units,
              unit_price: productReturn.unit_price,
            });
          }
        }
        setInitialFields((prev) => ({
          ...prev,
          customerName: saleReturnRes.customer_name,
          orderCode: saleReturnRes.sale_code,
          refund: saleReturnRes.refund ? saleReturnRes.refund : "0",
          ...productFieldData,
        }));
        setFetchData((prev) => ({
          ...prev,
          sold: saleReturnRes,
          products: allProductReturns,
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
          sold: null,
          products: [],
          error: error.message,
          empty: "",
          loading: false,
        }));
      });
  }, [reload, params]);

  const onClear = () => {
    setReload(!reload);
    setFetchData((prev) => ({
      ...prev,
      sold: null,
      products: [],
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
      <CreateCustomerReturnForm
        initialData={initialFields}
        products={fetchData.products}
        sold={fetchData.sold}
        onClear={onClear}
      />
    </div>
  );
}
