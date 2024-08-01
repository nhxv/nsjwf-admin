import PackingSlipToPrint from "../../view-customer-order-detail-page/components/PackingSlipToPrint";

export default function CustomerListPrint({ printRef, orders }) {
  return (
    <div ref={printRef}>
      {orders.map((order) => (
        <PackingSlipToPrint key={order.code} printRef={null} order={order} />
      ))}
    </div>
  );
}
