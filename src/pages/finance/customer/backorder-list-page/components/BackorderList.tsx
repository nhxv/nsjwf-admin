import { useNavigate } from "react-router-dom";
import { BackorderStatus } from "../../../../../commons/backorder-status.enum";
import OrderStatusTag from "../../../../../components/OrderStatusTag";
import { convertTime } from "../../../../../commons/time.util";
import { BiPrinter } from "react-icons/bi";

export default function BackorderList({ orders }) {
  const navigate = useNavigate();

  const onUpdateOrder = (code: string) => {
    navigate(`/finance/backorder/${code}`);
  }

  return (
  <>
    {orders.map((order) => {
      return (
      <div key={order.id} className="bg-white p-6 rounded-box shadow-md mb-8">
        {/* basic order info */}
        <div className="flex flex-row justify-between">
          <div>
            <div>
              <span className="font-semibold text-xl">{order.customerName}</span>
            </div>  
            <div className="mb-6">
              <span className="text-gray-400 text-sm">Expected at {convertTime(new Date(order.expectedAt))}</span>
            </div>   
            <div className="mb-2">
              <OrderStatusTag status={order.isArchived ? BackorderStatus.ARCHIVED : BackorderStatus.PENDING}></OrderStatusTag>
            </div>                 
          </div>

          {/* <div>
            <button type="button" className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 text-gray-500">
              <BiPrinter className="w-6 h-6"></BiPrinter>
            </button>
          </div> */}
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
        {order.productBackorders.map(productOrder => {
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
        {!order.isArchived ? (
        <>
          <div className="divider"></div>
          <button className="btn btn-primary w-full text-white mt-4" onClick={() => onUpdateOrder(order.id)}>Update order</button>
        </>): (<></>)}
      </div>)})
    }
  </>
  )
}