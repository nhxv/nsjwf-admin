export default function VendorReturnList({ returns }) {
  return (
    <>
      {returns.map((vendorReturn) => {
        return (
          <div key={vendorReturn.orderCode} className="custom-card mb-8">
            {/* basic order info */}
            <div className="flex flex-row justify-between">
              <div>
                <div>
                  <span>#{vendorReturn.orderCode}</span>
                </div>
                <div>
                  <span className="text-xl font-semibold">
                    {vendorReturn.vendorName}
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
              <div className="w-3/12 text-center">
                <span className="font-medium">Qty</span>
              </div>
              <div className="w-3/12 text-center">
                <span className="font-medium">Price</span>
              </div>
            </div>
            {vendorReturn.productVendorReturns.map((productReturn) => {
              return (
                <div
                  key={productReturn.productName}
                  className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3 dark:bg-base-300"
                >
                  <div className="ml-3 w-6/12">
                    <span>{productReturn.productName}</span>
                  </div>
                  <div className="w-3/12 text-center">
                    <span>
                      {productReturn.quantity} ({productReturn.unitCode})
                    </span>
                  </div>
                  <div className="w-3/12 text-center">
                    <span>${productReturn.unitPrice}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
