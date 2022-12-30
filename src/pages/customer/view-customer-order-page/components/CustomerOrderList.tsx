import { useNavigate } from "react-router-dom";
import { OrderStatus } from "../../../../commons/order-status.enum";
import StatusTag from "../../../../components/StatusTag";
import { convertTime } from "../../../../commons/time.util";
import { useAuthStore } from "../../../../stores/auth.store";
import { Role } from "../../../../commons/role.enum";
import CustomerOrderPrint from "./CustomerOrderPrint";
import { useState } from "react";

export default function CustomerOrderList({orders, printMode }) {
  const navigate = useNavigate();
  const role = useAuthStore(state => state.role);

  const onUpdateOrder = (code: string) => {
    navigate(`/customer/draft-customer-order/${code}`);
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
              <span className="font-semibold text-xl">{order.customerName}</span>
            </div>  
            <div className="">
              <span className="text-gray-400 text-sm">Expected at {convertTime(new Date(order.expectedAt))}</span>
            </div>   
            <div className="mb-6">
              <span className="text-gray-400 text-sm">by {order.assignTo}</span>
            </div>   
            <div className="mb-2">
              <StatusTag status={order.status}></StatusTag>
            </div>                 
          </div>
          {printMode ? (<CustomerOrderPrint order={order} />) : (<></>)}
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
            <span className="font-medium">Price</span>
          </div>
        </div>
        {order.productCustomerOrders.map(productOrder => {
          return (
          <div key={productOrder.productName} className="flex justify-center items-center py-3 bg-gray-100 rounded-btn mb-2">
            <div className="w-6/12 ml-2">
              <span>{productOrder.productName}</span>
            </div>
            <div className="w-3/12 text-center">
              <span>{productOrder.quantity}</span>
            </div>
            <div className="w-3/12 text-center">
              <span>{productOrder.unitPrice}</span>
            </div>
          </div>
          )
        })}
        {order.status !== OrderStatus.COMPLETED && (role ===  Role.MASTER || role === Role.ADMIN) ? (
        <>
          <div className="divider"></div>
          <button className="btn btn-primary text-white w-full mt-2" 
          onClick={() => onUpdateOrder(order.code)}>Update order</button>
        </>): (<></>)}
      </div>)})
    }
  </>
  )
}