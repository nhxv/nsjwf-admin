import { BackorderStatus } from "../commons/backorder-status.enum";
import { OrderStatus } from "../commons/order-status.enum";

export default function StatusTag({ status }) {
  return (
  <>
    {(status === OrderStatus.PICKING || 
    status === OrderStatus.CHECKING || 
    status === OrderStatus.SHIPPING ||
    status === OrderStatus.DELIVERED ||
    status === BackorderStatus.PENDING) ? (
    <>
      <span className={`p-3 text-sm rounded-full bg-yellow-100 text-yellow-600 font-medium`}>
        {status}
      </span>
    </>
    ) : (
    <>
      {status === OrderStatus.COMPLETED || 
      status === BackorderStatus.ARCHIVED ? (
      <>
        <span className={`p-3 text-sm rounded-full bg-emerald-100 text-emerald-600 font-medium`}>
          {status}
        </span>      
      </>
      ) : (
      <>
        <span className={`p-3 text-sm rounded-full bg-red-100 text-red-600 font-medium`}>
          {status}
        </span>   
      </>
      )}
    </>
    )}

  </>
  )
}