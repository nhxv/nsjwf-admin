import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import { convertTime } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import VendorOrderForm from "./VendorOrderForm";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";

export default function VendorOrderFormContainer() {
  const params = useParams();
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);
  const [fetchData, setFetchData] = useState({
    editedProducts: [],
    allProducts: [],
    vendors: [],
    prices: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [initialFields, setInitialFields] = useState({});
  const total = useMemo(() => {
    if (fetchData.prices.length > 0) {
      return niceVisualDecimal(
        +fetchData.prices.reduce(
          (prev, current) => prev + current.quantity * current.price,
          0
        )
      );
    } else return 0;
  }, [fetchData.prices]);

  useEffect(() => {
    setFetchData((prev) => ({
      ...prev,
      editedProducts: [],
      allProducts: [],
      vendors: [],
      employees: [],
      prices: [],
      error: "",
      empty: "",
      loading: true,
    }));
    // Unlike CO, doesn't make sense to have a vendor order
    // then we discontinue that product, so this is good for now.
    const productPromise = api.get(`/products/all`);
    const vendorPromise = api.get(`/vendors/active`);
    if (params.code) {
      // 1. edit mode
      const orderPromise = api.get(`/vendor-orders/${params.code}`);
      Promise.all([productPromise, vendorPromise, orderPromise])
        .then((res) => {
          const productRes = res[0];
          const vendorRes = res[1];
          const orderRes = res[2];
          if (
            productRes?.data?.length === 0 ||
            vendorRes?.data?.length === 0 ||
            !orderRes.data
          ) {
            setFetchData((prev) => ({
              ...prev,
              empty: "Such hollow, much empty...",
              error: "",
              loading: false,
            }));
          } else {
            // setup initial field values
            const updatedPrices = [];
            const editedProducts = [];
            const allProductsRes = productRes.data;
            const productFieldData = {};
            const productOrders = orderRes.data.productVendorOrders;
            for (const product of allProductsRes) {
              const similarProductOrders = productOrders.filter(
                (po) => po.product_name === product.name
              );
              if (similarProductOrders.length > 0) {
                for (let i = 0; i < similarProductOrders.length; i++) {
                  // similar products in existing order
                  let appear = i + 1;
                  productFieldData[`quantity${product.id}-${appear}`] =
                    similarProductOrders[i].quantity;
                  productFieldData[`unit${product.id}-${appear}`] =
                    similarProductOrders[i].unit_code.split("_")[1];
                  productFieldData[`price${product.id}-${appear}`] =
                    similarProductOrders[i].unit_price;
                  editedProducts.push({
                    id: product.id,
                    appear: appear,
                    name: product.name,
                    units: product.units,
                    recent_cost: product.recent_cost,
                  });
                  updatedPrices.push({
                    id: product.id,
                    appear: appear,
                    quantity:
                      productFieldData[`quantity${product.id}-${appear}`],
                    price: productFieldData[`price${product.id}-${appear}`],
                  });
                }

                for (
                  let i = similarProductOrders.length + 1;
                  i <= product.units.length;
                  i++
                ) {
                  productFieldData[`quantity${product.id}-${i}`] = 0;
                  productFieldData[`unit${product.id}-${i}`] = "BOX";
                  productFieldData[`price${product.id}-${i}`] = 0;
                  updatedPrices.push({
                    id: product.id,
                    appear: i,
                    quantity: productFieldData[`quantity${product.id}-${i}`],
                    price: productFieldData[`price${product.id}-${i}`],
                  });
                }
              } else {
                if (!product.discontinued) {
                  for (let i = 1; i <= product.units.length; i++) {
                    productFieldData[`quantity${product.id}-${i}`] = 0;
                    productFieldData[`unit${product.id}-${i}`] = "BOX";
                    productFieldData[`price${product.id}-${i}`] = 0;
                    updatedPrices.push({
                      id: product.id,
                      appear: i,
                      quantity: productFieldData[`quantity${product.id}-${i}`],
                      price: productFieldData[`price${product.id}-${i}`],
                    });
                  }
                }
              }
            }

            let attachmentPromise = null;
            if (orderRes.data.attachment) {
              attachmentPromise = api.get(
                `/images/vendor-orders/${params.code}`,
                {
                  // This wasted 1 real life day of debugging. I love you Javascript.
                  responseType: "blob",
                }
              );
            }
            setInitialFields((prev) => ({
              ...prev,
              vendorName: orderRes.data.vendor_name,
              status: orderRes.data.status,
              isTest: orderRes.data.is_test,
              code: orderRes.data.code,
              expectedAt: convertTime(new Date(orderRes.data.expected_at)),
              attachment: null,
              ...productFieldData,
            }));

            if (attachmentPromise !== null) {
              attachmentPromise
                .then((res) => {
                  if (res.data) {
                    const blob: Blob = res.data;
                    // Convert to File cuz if user doesn't change the attachment,
                    // the file will be sent back to backend to save again.
                    // If it is left as a Blob, this "file" will have the name "blob",
                    // which can cause conflict if another VO is updated.
                    // Naming it as the VO's code mitigate this problem.
                    const file = new File([blob], orderRes.data.code);
                    setInitialFields((prev) => ({
                      ...prev,
                      attachment: file,
                    }));
                  }
                })
                .catch(() => {
                  // No-op.
                });
            }
            setFetchData((prev) => ({
              ...prev,
              editedProducts: editedProducts,
              allProducts: allProductsRes,
              vendors: vendorRes.data,
              prices: updatedPrices,
              error: "",
              empty: "",
              loading: false,
            }));
          }
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

          if (error.status === 401) {
            handleTokenExpire(navigate, setFetchData);
          }
        });
    } else {
      // 2. create mode
      Promise.all([productPromise, vendorPromise])
        .then((res) => {
          const productRes = res[0];
          const vendorRes = res[1];
          if (productRes?.data?.length === 0 || vendorRes?.data?.length === 0) {
            setFetchData((prev) => ({
              ...prev,
              empty: "Such hollow, much empty...",
              error: "",
              loading: false,
            }));
          } else {
            // setup initial field values
            const updatedPrices = [];
            const productFieldData = {};
            for (const product of productRes.data) {
              for (let i = 1; i <= product.units.length; i++) {
                productFieldData[`quantity${product.id}-${i}`] = 0;
                productFieldData[`unit${product.id}-${i}`] = "BOX";
                productFieldData[`price${product.id}-${i}`] = 0;
                updatedPrices.push({
                  id: product.id,
                  appear: i,
                  quantity: productFieldData[`quantity${product.id}-${i}`],
                  price: productFieldData[`price${product.id}-${i}`],
                });
              }
            }
            const today = new Date();
            setInitialFields((prev) => ({
              ...prev,
              vendorName: ``,
              status: OrderStatus.SHIPPING,
              isTest: false,
              expectedAt: convertTime(today),
              attachment: null,
              ...productFieldData,
            }));
            setFetchData((prev) => ({
              ...prev,
              allProducts: productRes.data,
              vendors: vendorRes.data,
              prices: updatedPrices,
              error: "",
              empty: "",
              loading: false,
            }));
          }
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

          if (error.status === 401) {
            handleTokenExpire(navigate, setFetchData);
          }
        });
    }
  }, [reload, params]);

  const onClear = () => {
    setReload(!reload);
    setFetchData((prev) => ({
      ...prev,
      error: "",
      empty: "",
      loading: true,
    }));
  };

  const updatePrice = (value: number, inputId: string) => {
    let updatedPrices = [...fetchData.prices];
    if (inputId.includes("quantity")) {
      const [id, appear] = inputId.replace("quantity", "").split("-");
      const index = updatedPrices.findIndex(
        (p) => p.id === +id && p.appear === +appear
      );
      updatedPrices[index].quantity = value;
    } else if (inputId.includes("price")) {
      const [id, appear] = inputId.replace("price", "").split("-");
      const index = updatedPrices.findIndex(
        (p) => p.id === +id && p.appear === +appear
      );
      updatedPrices[index].price = value;
    } else if (inputId.includes("remove")) {
      const [id, appear] = inputId.replace("remove", "").split("-");
      const index = updatedPrices.findIndex(
        (p) => p.id === +id && p.appear === +appear
      );
      updatedPrices[index].quantity = 0;
      updatedPrices[index].price = 0;
    }
    setFetchData((prev) => ({ ...prev, prices: updatedPrices }));
  };

  const loadTemplate = async (vendorName: string) => {
    if (!params.code) {
      // load template when create
      try {
        const response = await api.get(
          `/vendors/active/tendency/${encodeURIComponent(vendorName)}`
        );
        return response.data.vendorProductTendencies;
      } catch (e) {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFetchData((prev) => ({
          ...prev,
          error: error.message,
          empty: "",
          loading: false,
        }));

        if (error.status === 401) {
          handleTokenExpire(navigate, setFetchData);
        }
      }
    }
  };

  const resetPrice = (newPrices) => {
    setFetchData((prev) => ({ ...prev, prices: newPrices }));
  };

  if (fetchData.loading) return <Spinner></Spinner>;
  if (fetchData.error)
    return <Alert message={fetchData.error} type="error"></Alert>;
  if (fetchData.empty)
    return <Alert message={fetchData.empty} type="empty"></Alert>;

  return (
    <div className="mb-12">
      <VendorOrderForm
        edit={!!params.code}
        initialData={initialFields}
        vendors={fetchData.vendors}
        editedProducts={
          fetchData.editedProducts?.length > 0 ? fetchData.editedProducts : null
        }
        allProducts={fetchData.allProducts}
        updatePrice={updatePrice}
        resetPrice={resetPrice}
        total={total}
        loadTemplate={loadTemplate}
        onClear={onClear}
      />
    </div>
  );
}
