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
      <span className={`p-2.5 text-sm rounded-full bg-warning text-warning-content font-medium`}>
        {status}
      </span>
    </>
    ) : (
    <>
      {status === OrderStatus.COMPLETED || 
      status === BackorderStatus.ARCHIVED ? (
      <>
        <span className={`p-2.5 text-sm rounded-full bg-success text-success-content font-medium`}>
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