import { convertTime } from "../../../../commons/utils/time.util";

export default function PalletLabelToPrint({ printRef, pallet, order }) {
  return (
    <div ref={printRef}>
      {pallet.list.map((_, index) => (
        <div
          className="flex h-full break-before-page items-center justify-center"
          key={`pallet-label-${index}`}
        >
          <div>
            <div className="block text-[20px] font-bold">
              {order.customerName}
            </div>
            <div className="block text-[8px]">
              Page {index + 1} of {pallet.list.length}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
