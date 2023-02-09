export default function VendorReturnList({returns}) {
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
              <span className="font-semibold text-xl">{vendorReturn.vendorName}</span>
            </div>               
          </div>
        </div>
        <div className="divider"></div>
        {/* products in order */}
        <div className="flex items-center mb-2">
          <div className="w-6/12">
            <span className="font-medium">Product</span>
          </div>
          <div className="w-3/12 text-center">
            <span className="font-medium">Qty</span>
          </div>
          <div className="w-3/12 text-center">
            <span className="font-medium">Unit Price</span>
          </div>
        </div>
        {vendorReturn.productVendorReturns.map(productReturn => {
          return (
          <div key={productReturn.productName} className="flex justify-center items-center py-3 bg-base-200 dark:bg-base-300 rounded-btn mb-2">
            <div className="w-6/12 ml-3">
              <span>{productReturn.productName}</span>
            </div>
            <div className="w-3/12 text-center">
              <span>{productReturn.quantity}</span>
            </div>
            <div className="w-3/12 text-center">
              <span>{productReturn.unitPrice}</span>
            </div>
          </div>
          )
        })}
      </div>)})
    }
  </>
  )
}