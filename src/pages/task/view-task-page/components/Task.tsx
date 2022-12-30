import StatusTag from "../../../../components/StatusTag";
import { convertTime } from "../../../../commons/time.util";
import { useAuthStore } from "../../../../stores/auth.store";
import api from "../../../../stores/api";
import { BiError } from "react-icons/bi";
import Spinner from "../../../../components/Spinner";
import { useState, useEffect } from "react";

export default function Task({ order, reload }) {
  const [formState, setFormState] = useState({
    error: "",
    loading: false,
  });

  useEffect(() => {
    // cleanup when destroy
    return () => {
      console.log("unmount");
      setFormState(prev => ({...prev, error: "", loading: false}));
    }
  }, []);

  const onFinishTask = async (code: string) => {
    setFormState(prev => ({...prev, error: "", loading: true}));
    try {
      const res = await api.put(`/customer-orders/tasks/${code}`);
      if (res) {
        setFormState(prev => ({...prev, error: "", loading: false}));
        reload();
      }
    } catch (e) {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setFormState(prev => ({...prev, error: error.message, loading: false}));
    }
  }

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
  {order.productCustomerOrders.map(productOrder => {
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
  <div className="divider"></div>
  <button className="btn btn-primary w-full text-white" onClick={() => onFinishTask(order.code)}>Done {order.status.toLowerCase()}</button>
  <div>
    {formState.loading ? (
    <>
      <div className="mt-5 flex justify-center">
        <Spinner></Spinner>
      </div>
    </>
    ) : (<></>)}
    {formState.error ? (
    <>
      <div className="mt-5 alert alert-error text-red-700 flex justify-center">
        <div>
          <BiError className="flex-shrink-0 w-6 h-6"></BiError>
          <span>{formState.error}</span>
        </div>
      </div>        
    </>
    ) : (<></>)}
  </div>
</div>)
}