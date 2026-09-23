import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import { convertTime } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import CustomerOrderForm from "./CustomerOrderForm";
import { handleTokenExpire } from "../../../../commons/utils/token.util";

export default function CustomerOrderFormContainer() {
  const params = useParams();
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);
  const [fetchData, setFetchData] = useState({
    editedProducts: [],
    allProducts: [],
    customers: [],
    employees: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [initialFields, setInitialFields] = useState({});

  useEffect(() => {
    setFetchData((prev) => ({
      ...prev,
      editedProducts: [],
      allProducts: [],
      customers: [],
      employees: [],
      error: "",
      empty: "",
      loading: true,
    }));
    // Need all products here for discontinued products inside orders.
    const productPromise = api.get(`/products/all`);
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
            const editedProducts = [];
            const allProductsRes = productRes.data;
            const productOrders = orderRes.data.productCustomerOrders;
            for (const product of allProductsRes) {
              const similarProductOrders = productOrders.filter(
                (po) => po.product_name === product.name
              );
              for (let i = 0; i < similarProductOrders.length; i++) {
                // similar products in existing order
                let appear = i + 1;
                editedProducts.push({
                  id: product.id,
                  appear: appear,
                  name: product.name,
                  units: product.units,
                  recent_cost: product.recent_cost,
                  quantity: similarProductOrders[i].quantity,
                  unit: similarProductOrders[i].unit_code.split("_")[1],
                  // Need to put this here so it doesn't give a warning about uncontrolled component or sth.
                  price: similarProductOrders[i].unit_price
                    ? similarProductOrders[i].unit_price
                    : "",
                });
              }
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
              note: orderRes.data.note,
              expectedAt: convertTime(new Date(orderRes.data.expected_at)),
            }));
            setFetchData((prev) => ({
              ...prev,
              editedProducts: editedProducts,
              allProducts: allProductsRes,
              customers: customerRes.data,
              employees: employeeRes.data,
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

          if (error.status === 401) {
            handleTokenExpire(navigate, setFetchData);
          }
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
            const today = new Date();
            setInitialFields((prev) => ({
              ...prev,
              customerName: "",
              manualCode: "",
              employeeName: employeeRes.data[0].nickname,
              status: OrderStatus.PICKING,
              isTest: false,
              expectedAt: convertTime(today),
              note: "",
            }));
            setFetchData((prev) => ({
              ...prev,
              allProducts: productRes.data,
              customers: customerRes.data,
              employees: employeeRes.data,
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
      editedProducts: [],
      allProducts: [],
      customers: [],
      employees: [],
      error: "",
      empty: "",
      loading: true,
    }));
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
          empty: "",
          loading: false,
        }));

        if (error.status === 401) {
          handleTokenExpire(navigate, setFetchData);
        }
      }
    }
  };

  if (fetchData.loading) return <Spinner></Spinner>;
  if (fetchData.error)
    return <Alert message={fetchData.error} type="error"></Alert>;
  if (fetchData.empty)
    return <Alert message={fetchData.empty} type="empty"></Alert>;

  return (
    <div className="mb-12">
      <CustomerOrderForm
        edit={!!params.code}
        initialData={initialFields}
        customers={fetchData.customers}
        editedProducts={
          fetchData.editedProducts?.length > 0 ? fetchData.editedProducts : null
        }
        allProducts={fetchData.allProducts}
        employees={fetchData.employees}
        loadTemplate={loadTemplate}
        onClear={onClear}
      />
    </div>
  );
}
