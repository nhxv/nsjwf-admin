import { convertTime } from "../../../../commons/time.util";

export default function PackingSlipToPrint({ printRef, order }) {
  return (
  <div ref={printRef} className="px-6 py-2 break-after-page">
    <div className="flex flex-col">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="block text-[0.625rem] font-serif">New San Jose Wholesale Foods, Inc.</h1>
            <p className="block text-[0.5rem]">1005 S. 5th St, San Jose, CA 95112</p>
            <p className="block text-[0.5rem]">Mailing Address: P.O. Box 730967, San Jose, CA 95173 - 0967</p>
            <p className="block text-[0.5rem]">Tel: (408) 279-3888 • (408) 279-3889 • (408) 279-0413 • Fax: (408) 279-3890</p>
          </div>
          <div>
            <p className="text-xs"><span className="font-semibold">Invoice No.:</span> {`327353`}</p>
            <p className="text-xs"><span className="font-semibold">Ship at:</span> {convertTime(new Date(order.expectedAt))}</p>
          </div>
        </div>

      </div>
      <div className="mb-8 ml-24">
        <div className="block text-2xl">Packing Slip</div>
        <div className="text-4xl font-bold block">{order.customerName}</div>
      </div>
      <div className="flex pb-1 w-9/12 border-black border-b-4 ml-24">
        <div className="font-semibold w-8/12">Item Description</div>
        <div className="font-semibold w-4/12 text-center">Quantity</div>
      </div>
      {order.productCustomerOrders.map(productOrder => (
      <div key={productOrder.productName} className="flex py-2 w-9/12 border-black border-b ml-24">
        <div className="w-8/12">{productOrder.productName}</div>
        <div className="w-4/12 text-center font-semibold">{productOrder.quantity}</div>
      </div>
      ))}
    </div>
  </div>    
  );
}