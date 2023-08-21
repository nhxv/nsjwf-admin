import Alert, { AlertFromQueryError } from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function CustomerReturnList() {
  const navigate = useNavigate();

  const returnQuery = useQuery<any, any>({
    queryKey: ["returns"],
    queryFn: async () => {
      const result = await api.get("/customer-returns");
      return result.data;
    },
  });

  if (
    returnQuery.status === "loading" ||
    returnQuery.fetchStatus === "fetching"
  ) {
    return <Spinner></Spinner>;
  }

  if (
    returnQuery.fetchStatus === "paused" ||
    (returnQuery.status === "error" && returnQuery.fetchStatus === "idle")
  ) {
    <AlertFromQueryError queryError={returnQuery.error} />;
  }

  if (returnQuery.data?.length === 0) {
    return <Alert message="Such hollow, much empty..." type="empty"></Alert>;
  }

  return (
    <>
      {returnQuery.data.map((customerReturn) => {
        return (
          <div key={customerReturn.orderCode} className="custom-card mb-8">
            {/* basic order info */}
            <div className="flex flex-row justify-between">
              <div>
                <div>
                  <span>#{customerReturn.orderCode}</span>
                </div>
                <div>
                  <span className="text-xl font-semibold">
                    {customerReturn.customerName}
                  </span>
                </div>
              </div>
            </div>
            <div className="divider"></div>
            {/* products in order */}
            <div className="mb-2 flex items-center">
              <div className="w-6/12">
                <span className="font-medium">Product</span>
              </div>
              <div className="w-6/12 text-center">
                <span className="font-medium">Qty</span>
              </div>
            </div>
            {customerReturn.productCustomerReturns.map((productReturn) => {
              return (
                <div
                  key={productReturn.unitCode}
                  className="rounded-btn mb-2 flex items-center bg-base-200 py-3 dark:bg-base-300"
                >
                  <div className="ml-3 w-6/12">
                    <span>{productReturn.productName}</span>
                  </div>
                  <div className="w-6/12 text-center">
                    <span>
                      {productReturn.quantity}{" "}
                      {productReturn.unitCode === "box"
                        ? ``
                        : `(${productReturn.unitCode})`}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="divider"></div>
            <div className="mt-2 flex items-center gap-2">
              <span>Refund:</span>
              <span className="text-xl font-medium">
                ${customerReturn.refund}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}
