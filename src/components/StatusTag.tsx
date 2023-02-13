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
        className={`p-2.5 text-sm rounded-full bg-warning text-warning-content font-medium`}
      >
        {status}
      </span>
    );
  }

  if (status === OrderStatus.COMPLETED || status === BackorderStatus.ARCHIVED) {
    return (
      <span
        className={`p-2.5 text-sm rounded-full bg-success text-success-content font-medium`}
      >
        {status}
      </span>
    );
  }

  return null;
}
