import { useParams } from "react-router-dom";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import { convertTime } from "../../../../commons/utils/time.util";
import Alert, { AlertFromQueryError } from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import VendorOrderForm from "./VendorOrderForm";
import { useQueries, useQueryClient } from "@tanstack/react-query";

interface IFetchData {
  editedProducts?: any;
  allProducts: any;
  vendors: any;
  prices: any;
}

export default function VendorOrderFormContainer() {
  const params = useParams();

  let fetchData: IFetchData = {
    editedProducts: null,
    allProducts: null,
    vendors: null,
    prices: null,
  };
  let initialField = {};
  let isEmpty = false;
  const queryClient = useQueryClient();

  const [productQuery, vendorQuery, orderQuery, attachmentQuery] = useQueries({
    queries: [
      {
        queryKey: ["products", "all"],
        queryFn: async () => {
          const result = await api.get("/products/all");
          return result.data;
        },
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["vendors", "active"],
        queryFn: async () => {
          const result = await api.get("/vendors/active");
          return result.data;
        },
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["vendor-orders", params?.code],
        queryFn: async () => {
          const result = await api.get(`/vendor-orders/${params.code}`);
          return result.data;
        },
        enabled: !!params.code,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["images", "vendor-orders", params?.code],
        queryFn: async () => {
          const result = await api.get(`/images/vendor-orders/${params.code}`, {
            responseType: "blob",
          });
          const blob: Blob = result.data;
          const file = new File([blob], params.code);
          return file;
        },
        enabled: !!params.code,
        refetchOnWindowFocus: false,
      },
    ],
  });

  // create mode
  if (!params.code) {
    if (productQuery.isSuccess && vendorQuery.isSuccess) {
      const products = productQuery.data;
      const vendors = vendorQuery.data;

      if (products.length === 0 || vendors.length === 0) {
        isEmpty = true;
      } else {
        const updatedPrices = [];
        const productFieldData = {};
        for (const product of productQuery.data) {
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
        initialField = {
          vendorName: "",
          manualCode: "",
          status: OrderStatus.CHECKING,
          isTest: false,
          expectedAt: convertTime(today),
          attachment: null,
          ...productFieldData,
        };
        fetchData = {
          allProducts: productQuery.data,
          vendors: vendorQuery.data,
          prices: updatedPrices,
        };
      }
    }
  }
  // edit mode
  else {
    if (
      productQuery.isSuccess &&
      vendorQuery.isSuccess &&
      orderQuery.isSuccess
    ) {
      const products = productQuery.data;
      const vendors = vendorQuery.data;
      const order = orderQuery.data;

      if (products.length === 0 || vendors.length === 0 || !order) {
        isEmpty = true;
      } else {
        // setup initial field values
        const updatedPrices = [];
        const editedProducts = [];
        const allProductsRes = products;
        const productFieldData = {};
        const productOrders = order.productVendorOrders;
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
                quantity: productFieldData[`quantity${product.id}-${appear}`],
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

        fetchData = {
          editedProducts: editedProducts,
          allProducts: allProductsRes,
          vendors: vendors,
          prices: updatedPrices,
        };
        initialField = {
          vendorName: order.vendor_name,
          status: order.status,
          isTest: order.is_test,
          code: order.code,
          manualCode: order.manual_code ?? "",
          expectedAt: convertTime(new Date(order.expected_at)),
          attachment: attachmentQuery.isSuccess ? attachmentQuery.data : null,
          attachmentExists: !!order.attachment,
          ...productFieldData,
        };
      }
    }
  }

  const onClear = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        return (
          query.queryKey[0] === "vendor-orders" ||
          query.queryKey[0] === "images"
        );
      },
    });
  };

  if (
    vendorQuery.isFetching ||
    vendorQuery.isPending ||
    productQuery.isFetching ||
    productQuery.isPending ||
    orderQuery.isFetching
    // If in create mode, query for order will never start so checking for isPending is not appropriate.
  ) {
    return <Spinner />;
  }

  // Offline
  if (vendorQuery.isPaused || productQuery.isPaused || orderQuery.isPaused) {
    return <Alert type="error" message="Network Error" />;
  }

  // If any of the query errors even after retries.
  if (
    (vendorQuery.isError && vendorQuery.fetchStatus === "idle") ||
    (productQuery.isError && productQuery.fetchStatus === "idle") ||
    (orderQuery.isError && orderQuery.fetchStatus === "idle")
  ) {
    const error = vendorQuery.isError
      ? vendorQuery.error
      : productQuery.isError
      ? productQuery.error
      : orderQuery.error;

    return <AlertFromQueryError queryError={error} />;
  }

  if (isEmpty) {
    return <Alert message={"Such hollow, much empty..."} type="empty"></Alert>;
  }

  return (
    <div className="mb-12">
      <VendorOrderForm
        edit={!!params.code}
        initialData={initialField}
        fetchData={fetchData}
        vendors={fetchData.vendors}
        editedProducts={
          fetchData.editedProducts?.length > 0 ? fetchData.editedProducts : null
        }
        allProducts={fetchData.allProducts}
        onClear={onClear}
      />
    </div>
  );
}
