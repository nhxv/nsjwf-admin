import { OrderStatus } from "../commons/enums/order-status.enum";
import { PaymentStatus } from "../commons/enums/payment-status.enum";

export default function StatusTag({ status }) {
  if (
    status === OrderStatus.PICKING ||
    status === OrderStatus.CHECKING ||
    status === OrderStatus.SHIPPING ||
    status === OrderStatus.DELIVERED ||
    status === PaymentStatus.RECEIVABLE
  ) {
    return (
      <span
        className={`rounded-full bg-warning p-2.5 text-sm font-medium text-warning-content`}
      >
        {status}
      </span>
    );
  }
  if (
    status === OrderStatus.COMPLETED ||
    status === PaymentStatus.CASH ||
    status === PaymentStatus.CHECK
  ) {
    return (
      <span
        className={`rounded-full bg-success p-2.5 text-sm font-medium text-success-content`}
      >
        {status}
      </span>
    );
  }
  return null;
}
