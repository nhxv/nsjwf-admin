import { useNavigate } from "react-router-dom";
import { OrderStatus } from "../../../../commons/order-status.enum";
import StatusTag from "../../../../components/StatusTag";
import { convertTime } from "../../../../commons/time.util";
import { useAuthStore } from "../../../../stores/auth.store";
import { Role } from "../../../../commons/role.enum";

export default function VendorOrderList({orders}) {
  const navigate = useNavigate();
  const role = useAuthStore(state => state.role);

  const onUpdateOrder = (code: string) => {
    navigate(`/vendor/draft-vendor-order/${code}`);
  }

  return (
  <>
    {orders.map((order) => {
      return (
      <div key={order.code} className="bg-white p-6 rounded-box shadow-md mb-8">
        {/* basic order info */}
        <div className="flex flex-row justify-between">
          <div>
            <div>
              <span>#{order.code}</span>
            </div>
            <div>
              <span className="font-semibold text-xl">{order.vendorName}</span>
            </div>  
            <div className="mb-6">
              <span className="text-gray-400 text-sm">Expected at {convertTime(new Date(order.expectedAt))}</span>
            </div>   
            <div className="mb-2">
              <StatusTag status={order.status}></StatusTag>
            </div>                 
          </div>
        </div>
        <div className="divider"></div>
        {/* products in order */}
        <div className="flex items-center mb-2">
          <div className="w-10/12">
            <span className="font-medium">Product</span>
          </div>
          <div className="w-2/12 text-center">
            <span className="font-medium">Qty</span>
          </div>
        </div>
        {order.productVendorOrders.map(productOrder => {
          return (
          <div key={productOrder.productName} className="flex justify-center items-center py-3 bg-gray-100 rounded-btn mb-2">
            <div className="w-10/12 ml-3">
              <span>{productOrder.productName}</span>
            </div>
            <div className="w-2/12 text-center">
              <span>{productOrder.quantity}</span>
            </div>
          </div>
          )
        })}
        {order.status !== OrderStatus.COMPLETED && (role === Role.MASTER || role === Role.ADMIN) ? (
        <>
          <div className="divider"></div>
          <button className="btn btn-primary w-full text-white" onClick={() => onUpdateOrder(order.code)}>Update order</button>
        </>): (<></>)}
      </div>)})
    }
  </>
  )
}