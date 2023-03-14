import { useNavigate } from "react-router-dom";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import { Role } from "../../../../commons/enums/role.enum";
import { convertTime } from "../../../../commons/utils/time.util";
import StatusTag from "../../../../components/StatusTag";
import { useAuthStore } from "../../../../stores/auth.store";
import CustomerOrderPrint from "./CustomerOrderPrint";

export default function CustomerOrderList({ orders, printMode }) {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);

  const onUpdateOrder = (code: string) => {
    navigate(`/customer/draft-customer-order/${code}`);
  };

  return (
    <>
      {orders.map((order) => {
        return (
          <div key={order.code} className="custom-card mb-8">
            {/* basic order info */}
            <div className="flex justify-between">
              <div>
                <span className="block">
                  #{order.manualCode ? order.manualCode : order.code}
                </span>
                <span className="block text-xl font-semibold">
                  {order.customerName}
                </span>
                <span className="block text-sm text-neutral">
                  Expected at {convertTime(new Date(order.expectedAt))}
                </span>
                <div className="mb-6">
                  <span className="text-sm text-neutral">
                    by {order.assignTo}
                  </span>
                </div>
                <div className="mb-2">
                  <StatusTag status={order.status}></StatusTag>
                </div>
              </div>
              {printMode && <CustomerOrderPrint order={order} />}
            </div>
            <div className="divider"></div>
            {/* products in order */}
            <div className="mb-2 flex items-center">
              <div className="w-9/12">
                <span className="font-medium">Product</span>
              </div>
              <div className="w-3/12 text-center">
                <span className="font-medium">Qty</span>
              </div>
            </div>
            {order.productCustomerOrders.map((productOrder) => {
              return (
                <div
                  key={productOrder.productName}
                  className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3 dark:bg-base-300"
                >
                  <div className="ml-3 w-9/12">
                    <span>{productOrder.productName}</span>
                  </div>
                  <div className="w-3/12 text-center">
                    <span>
                      {productOrder.quantity} {productOrder.unitCode === "box" ? `` : `(${productOrder.unitCode})`}
                    </span>
                  </div>
                </div>
              );
            })}
            {order.status !== OrderStatus.COMPLETED &&
              (role === Role.MASTER || role === Role.ADMIN) && (
                <>
                  <div className="divider"></div>
                  <button
                    className="btn-primary btn w-full"
                    onClick={() => onUpdateOrder(order.code)}
                  >
                    Update order
                  </button>
                </>
              )}
          </div>
        );
      })}
    </>
  );
}
