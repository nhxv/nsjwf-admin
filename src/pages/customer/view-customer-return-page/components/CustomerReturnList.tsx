export default function CustomerReturnList({ returns }) {
  return (
    <>
      {returns.map((customerReturn) => {
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
                  key={productReturn.productName}
                  className="rounded-btn mb-2 flex items-center bg-base-200 py-3 dark:bg-base-300"
                >
                  <div className="ml-3 w-6/12">
                    <span>{productReturn.productName}</span>
                  </div>
                  <div className="w-6/12 text-center">
                    <span>
                      {productReturn.quantity} {productReturn.unitCode === "box" ? `` : `(${productReturn.unitCode})`}
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
