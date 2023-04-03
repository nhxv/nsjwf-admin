import { convertTimeToText } from "../../../../commons/utils/time.util";

export default function PackingSlipToPrint({ printRef, order }) {
  return (
    <div ref={printRef} className="break-after-page px-6 py-4">
      <div className="flex flex-col">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="block font-serif text-[0.625rem]">
                New San Jose Wholesale Foods, Inc.
              </h1>
              <p className="block text-[0.5rem]">
                1005 S. 5th St, San Jose, CA 95112
              </p>
              <p className="block text-[0.5rem]">
                Mailing Address: P.O. Box 730967, San Jose, CA 95173 - 0967
              </p>
              <p className="block text-[0.5rem]">
                Tel: (408) 279-3888 • (408) 279-3889 • (408) 279-0413 • Fax:
                (408) 279-3890
              </p>
            </div>
            <div>
              <p className="text-xs">
                Invoice No.:{" "}
                <span className="font-semibold">
                  {order.manualCode ? order.manualCode : order.code}
                </span>
              </p>
              <p className="text-xs">
                Ship at:{" "}
                <span className="font-semibold">
                  {convertTimeToText(new Date(order.expectedAt))}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="mb-6 ml-24">
          <div className="block text-xl">Packing Slip</div>
          <div className="block text-2xl font-bold">{order.customerName}</div>
        </div>
        <div className="ml-24 flex w-9/12 border-b-4 border-black pb-1">
          <div className="w-[64px] text-sm font-semibold">Qty</div>
          <div className="ml-8 text-sm font-semibold">Item Description</div>
        </div>
        {order.productCustomerOrders.map((productOrder) => (
          <div
            key={`${productOrder.productName}_${productOrder.unitCode}`}
            className="ml-24 flex w-9/12 border-b border-black py-2"
          >
            <div className="w-[64px] font-semibold">
              {productOrder.quantity}{" "}
              {productOrder.unitCode === "box"
                ? ``
                : `(${productOrder.unitCode})`}
            </div>
            <div className="ml-8">{productOrder.productName}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
