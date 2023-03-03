import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import { convertTime } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import CustomerOrderForm from "./CustomerOrderForm";
0;
export default function CustomerOrderFormContainer() {
  const params = useParams();
  const [reload, setReload] = useState(false);
  const [fetchData, setFetchData] = useState({
    editedProducts: [],
    allProducts: [],
    customers: [],
    employees: [],
    prices: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [initialFields, setInitialFields] = useState({});
  const total = useMemo(() => {
    if (fetchData.prices.length > 0) {
      return +fetchData.prices
        .reduce((prev, current) => prev + current.quantity * current.price, 0)
        .toFixed(2);
    } else return 0;
  }, [fetchData.prices]);

  useEffect(() => {
    const productPromise = api.get(`/products/active`);
    const customerPromise = api.get(`/customers/active`);
    const employeePromise = api.get(`/accounts/employees/active`);
    if (params.code) {
      // edit mode
      const orderPromise = api.get(`/customer-orders/${params.code}`);
      Promise.all([
        productPromise,
        customerPromise,
        employeePromise,
        orderPromise,
      ])
        .then((res) => {
          const productRes = res[0];
          const customerRes = res[1];
          const employeeRes = res[2];
          const orderRes = res[3];
          if (
            productRes?.data?.length === 0 ||
            customerRes?.data?.length === 0 ||
            employeeRes?.data?.length === 0 ||
            !orderRes.data
          ) {
            setFetchData((prev) => ({
              ...prev,
              error: "",
              empty: "Such hollow, much empty...",
              loading: false,
            }));
          } else {
            // setup initial field values
            const updatedPrices = [];
            const editedProductsRes = [];
            const allProductsRes = productRes.data;
            const productFieldData = {};
            const productOrders = orderRes.data.productCustomerOrders;
            for (const product of allProductsRes) {
              const productOrder = productOrders.find(
                (po) => po.product_name === product.name
              );
              if (productOrder) {
                productFieldData[`quantity${product.id}`] =
                  productOrder.quantity;
                productFieldData[`unit${product.id}`] =
                  productOrder.unit_code.split("_")[1];
                productFieldData[`price${product.id}`] =
                  productOrder.unit_price;
                editedProductsRes.push({
                  id: product.id,
                  name: product.name,
                  units: product.units,
                  sell_price: product.sell_price,
                });
              } else {
                productFieldData[`quantity${product.id}`] = 0;
                productFieldData[`unit${product.id}`] = "BOX";
                productFieldData[`price${product.id}`] = 0;
              }
              updatedPrices.push({
                id: product.id,
                quantity: productFieldData[`quantity${product.id}`],
                price: productFieldData[`price${product.id}`],
              });
            }
            setInitialFields((prev) => ({
              ...prev,
              customerName: orderRes.data.customer_name,
              employeeName: orderRes.data.assign_to,
              status: orderRes.data.status,
              isTest: orderRes.data.is_test,
              code: orderRes.data.code,
              manualCode: orderRes.data.manual_code
                ? orderRes.data.manual_code
                : "",
              expectedAt: convertTime(new Date(orderRes.data.expected_at)),
              ...productFieldData,
            }));
            setFetchData((prev) => ({
              ...prev,
              editedProducts: editedProductsRes,
              allProducts: allProductsRes,
              customers: customerRes.data,
              employees: employeeRes.data,
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
            editedProducts: [],
            allProducts: [],
            customers: [],
            employees: [],
            prices: [],
            error: error.message,
            empty: "",
            loading: false,
          }));
        });
    } else {
      // create mode
      Promise.all([productPromise, customerPromise, employeePromise])
        .then((res) => {
          const productRes = res[0];
          const customerRes = res[1];
          const employeeRes = res[2];
          if (
            productRes?.data?.length === 0 ||
            customerRes?.data?.length === 0 ||
            employeeRes?.data?.length === 0
          ) {
            setFetchData((prev) => ({
              ...prev,
              empty: "Such hollow, much empty...",
              error: "",
              loading: false,
            }));
          } else {
            // setup initial field values
            let updatedPrices = [];
            const productFieldData = {};
            for (const product of productRes.data) {
              productFieldData[`quantity${product.id}`] = 0;
              productFieldData[`unit${product.id}`] = "BOX";
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
            setInitialFields((prev) => ({
              ...prev,
              customerName: ``,
              employeeName: employeeRes.data[0].nickname,
              status: OrderStatus.PICKING,
              isTest: false,
              expectedAt: convertTime(nextDay),
              ...productFieldData,
            }));
            setFetchData((prev) => ({
              ...prev,
              allProducts: productRes.data,
              customers: customerRes.data,
              employees: employeeRes.data,
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
            loading: false,
          }));
        });
    }
  }, [reload, params]);

  const onClear = () => {
    setReload(!reload);
    setFetchData((prev) => ({
      ...prev,
      editedProducts: [],
      allProducts: [],
      customers: [],
      employees: [],
      prices: [],
      error: "",
      empty: "",
      loading: true,
    }));
  };

  const updatePrice = (value: number, inputId: string) => {
    let updatedPrices = [...fetchData.prices];
    if (inputId.includes("quantity")) {
      const id = +inputId.replace("quantity", "");
      const index = updatedPrices.findIndex((p) => p.id === id);
      updatedPrices[index].quantity = value;
    } else if (inputId.includes("price")) {
      const id = +inputId.replace("price", "");
      const index = updatedPrices.findIndex((p) => p.id === id);
      updatedPrices[index].price = value;
    } else if (inputId.includes("remove")) {
      const id = +inputId.replace("remove", "");
      const index = updatedPrices.findIndex((p) => p.id === id);
      updatedPrices[index].quantity = 0;
      updatedPrices[index].price = 0;
    }
    setFetchData((prev) => ({ ...prev, prices: updatedPrices }));
  };

  const loadTemplate = async (customerName: string) => {
    if (!params.code) {
      // load template when create
      try {
        const response = await api.get(
          `/customers/active/tendency/${encodeURIComponent(customerName)}`
        );
        return response.data.customerProductTendencies;
      } catch (e) {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFetchData((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      }
    }
  };

  if (fetchData.loading) return <Spinner></Spinner>;
  if (fetchData.error)
    return <Alert message={fetchData.error} type="error"></Alert>;
  if (fetchData.empty)
    return <Alert message={fetchData.empty} type="empty"></Alert>;

  return (
    <div className="custom-card mb-12">
      <CustomerOrderForm
        edit={!!params.code}
        initialData={initialFields}
        customers={fetchData.customers}
        editedProducts={
          fetchData.editedProducts?.length > 0 ? fetchData.editedProducts : null
        }
        allProducts={fetchData.allProducts}
        employees={fetchData.employees}
        updatePrice={updatePrice}
        total={total}
        loadTemplate={loadTemplate}
        onClear={onClear}
      />
    </div>
  );
}
