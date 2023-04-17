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
    const returnRemainPromise = api.get(`/customer-return-remains/${params.code}`);
    const productPromise = api.get(`/products/active`);
    Promise.all([returnRemainPromise, productPromise])
      .then((res) => {
        const returnRemainRes = res[0].data;
        const allProductsRes = res[1].data;
        const productFieldData = {};
        const allProductReturns = [];
        for (const product of allProductsRes) {
          const similarProductReturns = returnRemainRes.productCustomerReturnRemains.filter(
            (pr) => pr.product_name === product.name
          );
          if (similarProductReturns.length > 0) {
            for (let i = 0; i < similarProductReturns.length; i++) {
              let appear = i + 1;
              productFieldData[`quantity${product.id}-${appear}`] = parseFraction(
                similarProductReturns[i].quantity
              );
              productFieldData[`unit${product.id}-${appear}`] =
                similarProductReturns[i].unit_code.split("_")[1];
              allProductReturns.push({
                id: product.id,
                appear: appear,
                name: similarProductReturns[i].product_name,
                quantity: similarProductReturns[i].quantity,
                unit_code: similarProductReturns[i].unit_code,
                units: product.units,
                unit_price: similarProductReturns[i].unit_price,
              });
            }
          }
        }
        setInitialFields((prev) => ({
          ...prev,
          customerName: returnRemainRes.customer_name,
          orderCode: returnRemainRes.order_code,
          refund: returnRemainRes.refund ? returnRemainRes.refund : "0",
          ...productFieldData,
        }));
        setFetchData((prev) => ({
          ...prev,
          sold: returnRemainRes,
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
