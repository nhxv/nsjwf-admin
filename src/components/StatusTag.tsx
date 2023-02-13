import { BackorderStatus } from "../commons/backorder-status.enum";
import { OrderStatus } from "../commons/order-status.enum";

export default function StatusTag({ status }) {
  if (
    status === OrderStatus.PICKING ||
    status === OrderStatus.CHECKING ||
    status === OrderStatus.SHIPPING ||
    status === OrderStatus.DELIVERED ||
    status === BackorderStatus.PENDING
  ) {
    return (
      <span
        className={`rounded-full bg-warning p-2.5 text-sm font-medium text-warning-content`}
      >
        {status}
      </span>
    );
  }

  if (status === OrderStatus.COMPLETED || status === BackorderStatus.ARCHIVED) {
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
