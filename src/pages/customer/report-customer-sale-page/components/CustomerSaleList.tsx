import { convertTime } from "../../../../commons/time.util";

export default function CustomerSaleList({ reports }) {
  return (
    <>
      {reports.map((report) => {
        return (
          <div key={report.order_code} className="custom-card mb-8">
            {/* basic report info */}
            <div className="flex flex-row justify-between">
              <div>
                <div>
                  <span>
                    #
                    {report.manual_code
                      ? report.manual_code
                      : report.order_code}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-xl">
                    {report.customer_name}
                  </span>
                </div>
                <div className="">
                  <span className="text-neutral text-sm">
                    Completed at {convertTime(new Date(report.date))}
                  </span>
                </div>
              </div>
            </div>
            <div className="divider"></div>
            {/* products in report */}
            <div className="flex items-center mb-2">
              <div className="w-6/12">
                <span className="font-medium">Product</span>
              </div>
              <div className="w-3/12 text-center">
                <span className="font-medium">Qty</span>
              </div>
              <div className="w-3/12 text-center">
                <span className="font-medium">Price</span>
              </div>
            </div>
            {report.productCustomerOrders.map((productOrder) => {
              return (
                <div
                  key={productOrder.product_name}
                  className="flex justify-center items-center py-3 bg-base-200 dark:bg-base-300 rounded-btn mb-2"
                >
                  <div className="w-6/12 ml-3">
                    <span>{productOrder.product_name}</span>
                  </div>
                  <div className="w-3/12 text-center">
                    <span>{productOrder.quantity}</span>
                  </div>
                  <div className="w-3/12 text-center">
                    <span>{productOrder.unit_price}</span>
                  </div>
                </div>
              );
            })}
            <div className="divider"></div>
            <div className="mt-2 flex items-center">
              <span className="mr-2">Total:</span>
              <span className="font-medium text-xl mr-2">${report.sale}</span>
              <span className="text-red-600">-${report.refund}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}
