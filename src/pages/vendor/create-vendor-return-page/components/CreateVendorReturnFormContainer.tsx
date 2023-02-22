import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useFirstRender from "../../../../commons/hooks/first-render.hook";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import CreateVendorReturnForm from "./CreateVendorReturnForm";

export default function CreateVendorReturnFormContainer({}) {
  const isFirstRender = useFirstRender();
  const params = useParams();
  const [reload, setReload] = useState(false);
  const [fetchData, setFetchData] = useState({
    error: "",
    empty: "",
    loading: true,
  });
  const [initialFields, setInitialFields] = useState({});
  const [dataState, setDataState] = useState({
    sold: null,
    products: [],
    prices: [],
  });
  const total = useMemo(() => {
    if (dataState.prices.length > 0) {
      return dataState.prices.reduce(
        (prev, current) => prev + current[0] * current[1],
        0
      );
    } else return 0;
  }, [dataState.prices]);

  useEffect(() => {
    api
      .get(`/vendor-sale-returns/${params.code}`)
      .then((res) => {
        const saleReturn = res.data;
        const updatedPrices = [];
        const productFieldData = {};
        for (let i = 0; i < saleReturn.productVendorSaleReturns.length; i++) {
          productFieldData[`quantity${i}`] =
            saleReturn.productVendorSaleReturns[i].quantity;
          updatedPrices.push([
            productFieldData[`quantity${i}`],
            saleReturn.productVendorSaleReturns[i].unit_price,
          ]);
        }
        setInitialFields((prev) => ({
          ...prev,
          vendorName: saleReturn.vendor_name,
          orderCode: saleReturn.sale_code,
          ...productFieldData,
        }));
        setDataState((prev) => ({
          ...prev,
          products: saleReturn.productVendorSaleReturns,
          sold: saleReturn,
          prices: updatedPrices,
        }));
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFetchData((prev) => ({
          ...prev,
          error: error.message,
          empty: "",
          loading: false,
        }));
      });
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
      error: "",
      empty: "",
      loading: true,
    }));
  };

  const updatePrice = (e, inputId: string) => {
    let updatedPrices = [...dataState.prices];
    if (inputId.includes("quantity")) {
      const index = +inputId.replace("quantity", "");
      updatedPrices[index][0] = +e.target.value;
    }
    setDataState((prev) => ({ ...prev, prices: updatedPrices }));
  };

  if (fetchData.loading) return <Spinner></Spinner>;
  if (fetchData.error)
    return <Alert message={fetchData.error} type="error"></Alert>;
  if (fetchData.empty)
    return <Alert message={fetchData.empty} type="empty"></Alert>;

  return (
    <div className="custom-card mb-12">
      <CreateVendorReturnForm
        initialData={initialFields}
        products={dataState.products}
        sold={dataState.sold}
        updatePrice={updatePrice}
        total={total}
        onClear={onClear}
      />
    </div>
  );
}
