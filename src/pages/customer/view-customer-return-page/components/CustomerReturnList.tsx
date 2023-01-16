import { useNavigate } from "react-router-dom";
import { convertTime } from "../../../../commons/time.util";
import { useAuthStore } from "../../../../stores/auth.store";
import { Role } from "../../../../commons/role.enum";

export default function CustomerReturnList({returns}) {
  const navigate = useNavigate();
  const role = useAuthStore(state => state.role);

  return (
  <>
    {returns.map((customerReturn) => {
      return (
      <div key={customerReturn.orderCode} className="bg-base-100 p-6 rounded-box shadow-md mb-8">
        {/* basic order info */}
        <div className="flex flex-row justify-between">
          <div>
            <div>
              <span>#{customerReturn.orderCode}</span>
            </div>
            <div>
              <span className="font-semibold text-xl">{customerReturn.customerName}</span>
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
        {customerReturn.productCustomerReturns.map(productReturn => {
          return (
          <div key={productReturn.productName} className="flex justify-center items-center py-3 bg-base-200 rounded-btn mb-2">
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