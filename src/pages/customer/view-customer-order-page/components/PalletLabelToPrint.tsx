import { convertTime } from "../../../../commons/time.util";

export default function PalletLabelToPrint({ printRef, pallet, order }) {
  return (
    <div ref={printRef}>
    {pallet.list.map((_, index) => (
    <div className="flex justify-center break-after-page" key={`pallet-label-${index}`}>
      <div>
        <div className="block text-2xl">#{order.code}</div>
        <div className="text-4xl font-bold block">{order.customerName}</div>
        <div className="text-2xl block mt-2">Ship at: {convertTime(new Date(order.expectedAt))}</div>
        <div className="block text-sm mt-2">Page {index + 1} of {pallet.list.length}</div> 
      </div>

    </div>
    ))}        
  </div>
  );
}