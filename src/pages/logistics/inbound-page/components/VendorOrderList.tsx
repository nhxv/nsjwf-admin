import { useNavigate } from "react-router-dom";
import { OrderStatus } from "../../../../commons/order-status.enum";
import OrderStatusTag from "../../../../components/OrderStatusTag";
import { convertTime } from "../../../../commons/time.util";

export default function VendorOrderList({orders}) {
  const navigate = useNavigate();

  const onUpdateOrder = (code: string) => {
    navigate(`/finance/vendor-order/${code}`);
  }

  return (
  <>
    {orders.map((order) => {
      return (
      <div key={order.code} className="bg-white p-6 rounded-box shadow-md mb-8">
        {/* basic order info */}
        <div className="flex flex-col xs:flex-row justify-between">
          <div>
            <div className="mb-2">
              <span className="block font-medium">Order ID:</span> 
              <span>{order.code}</span>
            </div>
            <div className="mb-2">
              <span className="block font-medium">Vendor:</span>
              <span>{order.vendorName}</span>
            </div>
          </div>

          <div>
            <div className="mb-2">
              <span className="block font-medium">Expected at:</span>
              <span>{convertTime(new Date(order.expectedAt))}</span>
            </div>
            <div className="mt-6">
              <OrderStatusTag status={order.status}></OrderStatusTag>
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
            <div className="w-10/12 ml-2">
              <span>{productOrder.productName}</span>
            </div>
            <div className="w-2/12 text-center">
              <span>{productOrder.quantity}</span>
            </div>
          </div>
          )
        })}
        {order.status !== OrderStatus.DELIVERED ? (
        <>
          <div className="divider"></div>
          <button className="btn btn-primary w-full text-white" onClick={() => onUpdateOrder(order.code)}>Update order</button>
        </>): (<></>)}
      </div>)})
    }
  </>
  )
}