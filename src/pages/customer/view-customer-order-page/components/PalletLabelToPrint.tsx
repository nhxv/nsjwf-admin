import { convertTime } from "../../../../commons/time.util";

export default function PalletLabelToPrint({ printRef, pallet, order }) {
  return (
    <div ref={printRef}>
    {pallet.list.map((_, index) => (
    <div className="flex break-after-page" key={`pallet-label-${index}`}>
      <div>
        {/* <div className="block text-2xl">#{order.code}</div> */}
        <div className="text-[4px] font-bold block">{order.customerName}</div>
        {/* <div className="text-xl block mt-2">Ship at: {convertTime(new Date(order.expectedAt))}</div> */}
        <div className="block text-[4px]">Page {index + 1} of {pallet.list.length}</div> 
      </div>

    </div>
    ))}        
  </div>
  );
}