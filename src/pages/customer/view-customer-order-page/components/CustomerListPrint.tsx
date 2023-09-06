import PackingSlipToPrint from "../../../../components/PackingSlipToPrint";

export default function CustomerListPrint({ printRef, orders }) {
  return (
    <div ref={printRef}>
      {orders.map((order) => (
        <PackingSlipToPrint key={order.code} printRef={null} order={order} />
      ))}
    </div>
  );
}
