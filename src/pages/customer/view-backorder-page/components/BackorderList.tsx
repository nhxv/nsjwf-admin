import { useNavigate } from "react-router-dom";
import { BackorderStatus } from "../../../../commons/backorder-status.enum";
import StatusTag from "../../../../components/StatusTag";
import { convertTime } from "../../../../commons/time.util";

export default function BackorderList({ orders }) {
  const navigate = useNavigate();

  const onUpdateOrder = (code: string) => {
    navigate(`/customer/draft-backorder/${code}`);
  };

  return (
    <>
      {orders.map((order) => {
        return (
          <div key={order.id} className="custom-card mb-8">
            {/* basic order info */}
            <div className="flex flex-row justify-between">
              <div>
                <div>
                  <span className="text-xl font-semibold">
                    {order.customerName}
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-sm text-neutral">
                    Expected at {convertTime(new Date(order.expectedAt))}
                  </span>
                </div>
                <div className="mb-2">
                  <StatusTag
                    status={
                      order.isArchived
                        ? BackorderStatus.ARCHIVED
                        : BackorderStatus.PENDING
                    }
                  ></StatusTag>
                </div>
              </div>
            </div>
            <div className="divider"></div>
            {/* products in order */}
            <div className="mb-2 flex items-center">
              <div className="w-10/12">
                <span className="font-medium">Product</span>
              </div>
              <div className="w-2/12 text-center">
                <span className="font-medium">Qty</span>
              </div>
            </div>
            {order.productBackorders.map((productOrder) => {
              return (
                <div
                  key={productOrder.productName}
                  className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3"
                >
                  <div className="ml-3 w-10/12">
                    <span>{productOrder.productName}</span>
                  </div>
                  <div className="w-2/12 text-center">
                    <span>{productOrder.quantity}</span>
                  </div>
                </div>
              );
            })}
            {!order.isArchived ? (
              <>
                <div className="divider"></div>
                <button
                  className="btn-primary btn mt-4 w-full"
                  onClick={() => onUpdateOrder(order.id)}
                >
                  Update order
                </button>
              </>
            ) : (
              <></>
            )}
          </div>
        );
      })}
    </>
  );
}
