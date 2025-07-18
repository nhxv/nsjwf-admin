import { useParams } from "react-router-dom";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import { convertTime } from "../../../../commons/utils/time.util";
import Alert, { AlertFromQueryError } from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import VendorOrderForm from "./VendorOrderForm";
import { useQueries, useQueryClient } from "@tanstack/react-query";

export default function VendorOrderFormContainer() {
  const params = useParams();

  let allProducts = null;
  let allVendors = null;

  let initialData = {};
  let existingProducts = [];

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
        const today = new Date();

        allVendors = vendorQuery.data;
        allProducts = productQuery.data;
        initialData = {
          vendorName: "",
          manualCode: "",
          status: OrderStatus.CHECKING,
          isTest: false,
          expectedAt: convertTime(today),
          attachment: null,
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
        const productOrders = order.productVendorOrders;

        allProducts = products;
        allVendors = vendors;
        existingProducts = productOrders;
        initialData = {
          vendorName: order.vendor_name,
          status: order.status,
          isTest: order.is_test,
          code: order.code,
          manualCode: order.manual_code ?? "",
          expectedAt: convertTime(new Date(order.expected_at)),
          attachment: attachmentQuery.isSuccess ? attachmentQuery.data : null,
          attachmentExists: !!order.attachment,
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
        onClear={onClear}
        vendors={allVendors}
        allProducts={allProducts}
        initialData={initialData}
        existingProducts={existingProducts}
      />
    </div>
  );
}
