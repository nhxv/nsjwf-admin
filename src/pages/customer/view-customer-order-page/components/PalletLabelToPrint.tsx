import { convertTime } from "../../../../commons/time.util";

export default function PalletLabelToPrint({ printRef, pallet, order }) {
  return (
    <div ref={printRef}>
    {pallet.list.map((_, index) => (
    <div className="flex break-before-page justify-center items-center h-full" key={`pallet-label-${index}`}>
      <div>
        { <div className="block text-[8px]">#{order.code}</div> }
        { <div className="block text-[16px] font-bold">{order.customerName}</div>}
        { <div className="block text-[8px]">Ship at: {convertTime(new Date(order.expectedAt))}</div>}
        { <div className="block text-[4px]">Page {index + 1} of {pallet.list.length}</div> }
      </div>

    </div>
    ))}        
  </div>
  );
}