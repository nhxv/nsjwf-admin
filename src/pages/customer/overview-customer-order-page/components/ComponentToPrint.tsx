import PackingSlipToPrint from "../../view-customer-order-detail-page/components/PackingSlipToPrint";

export default function ComponentToPrint({ printRef, orders }) {
  return (
    <div ref={printRef}>
      {orders.map((order) => (
        <PackingSlipToPrint printRef={null} order={order} />
      ))}
    </div>
  );
}
