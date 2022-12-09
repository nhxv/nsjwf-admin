import { useState} from "react";
import { BackorderStatus } from "../commons/backorder-status.enum";
import { OrderStatus } from "../commons/order-status.enum";

export default function OrderStatusTag({ status }) {
  return (
  <>
    {(status === OrderStatus.PICKING || 
    status === OrderStatus.CHECKING || 
    status === OrderStatus.SHIPPING ||
    status === BackorderStatus.PENDING) ? (
    <>
      <span className={`p-3 rounded-btn bg-yellow-100 text-yellow-600 font-medium`}>
        {status}
      </span>
    </>
    ) : (
    <>
      {status === OrderStatus.DELIVERED || 
      status === BackorderStatus.ARCHIVED ? (
      <>
        <span className={`p-3 rounded-btn bg-green-100 text-green-600 font-medium`}>
          {status}
        </span>      
      </>
      ) : (
      <>
        <span className={`p-3 rounded-btn bg-red-100 text-red-600 font-medium`}>
          {status}
        </span>   
      </>
      )}
    </>
    )}

  </>
  )
}