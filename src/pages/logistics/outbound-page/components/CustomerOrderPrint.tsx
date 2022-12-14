import { useReactToPrint } from "react-to-print";
import { useRef, useState, useEffect } from "react";
import { BiPrinter, BiX } from "react-icons/bi";
import { convertTime } from "../../../../commons/time.util";
import NumberInput from "../../../../components/NumberInput";

export default function CustomerOrderPrint({ order }) {
  const [pallet, setPallet] = useState({count: 1, list: [null]});
  const palletLabelToPrintRef = useRef<HTMLDivElement>(null);
  const handlePalletPrint = useReactToPrint({
    content: () => palletLabelToPrintRef.current,
  });

  const orderToPrintRef = useRef<HTMLDivElement>(null);
  const handleOrderPrint = useReactToPrint({
    content: () => orderToPrintRef.current,
  });

  const onPalletPrint = () => {
    if (pallet.count < 1 || pallet.list.length < 1) {
      return;
    }
    handlePalletPrint();
  }

  const onChange = (e) => {
    const newArr = [];
    for (let i = 0; i < e.target.value; i++) {
      newArr.push(null);
    }
    setPallet(prev => ({...prev, count: e.target.value, list: newArr}));
  }

  return (
  <>
    <div className="hidden">
      {/* Customer Order to print */}
      <div ref={orderToPrintRef} className="px-6 py-4">
        <div className="flex flex-col">
          <div className="mb-8">
            <h1 className="block text-sm font-serif">New San Jose Wholesale Foods, Inc.</h1>
            <p className="block text-xs">1005 S. 5th St, San Jose, CA 95112</p>
            <p className="block text-xs">Mailing Address: P.O. Box 730967, San Jose, CA 95173 - 0967</p>
            <p className="block text-xs">Tel: (408) 279-3888 • (408) 279-3889 • (408) 279-0413 • Fax: (408) 279-3890</p>
          </div>
          <div className="mb-8 ml-24">
            <div className="block text-2xl">#{order.code}</div>
            <div className="text-4xl font-bold block">{order.customerName}</div>
            <div className="text-2xl mt-2">Ship at: {convertTime(new Date(order.expectedAt))}</div>
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

      {/* Pallet to print */}
      <div ref={palletLabelToPrintRef}>
        {pallet.list.map((item, index) => (
        <div className="h-screen px-6" key={`pallet-label-${index}`}>
          <div className="block text-2xl">#{order.code}</div>
          <div className="text-4xl font-bold block">{order.customerName}</div>
          <div className="text-2xl block mt-2">Ship at: {convertTime(new Date(order.expectedAt))}</div>
          <div className="block text-sm mt-2">Page {index + 1} of {pallet.list.length}</div> 
        </div>
        ))}        
      </div>
    </div>

    {/* Pallet modal */}
    <input type="checkbox" id={`modal-${order.code}`} className="modal-toggle" />
      <div className="modal">
        <div className="modal-box p-0 md:w-4/12 sm:w-6/12 w-8/12">
        <div className="flex justify-end px-4 mt-4">
          <label htmlFor={`modal-${order.code}`} className="btn btn-circle btn-ghost btn-sm bg-gray-100">
            <BiX className="h-6 w-6"></BiX>
          </label>
        </div>
        <div className="mb-5 mx-4">
          <label htmlFor="name" className="font-medium inline-block mb-2">
            <span>Number of pallet</span>
            <span className="text-red-500">*</span>
          </label>
          <NumberInput id="pallet" name="pallet" placeholder={`Number of Pallet`} 
          value={pallet.count} min={1} max={100} 
          onChange={onChange}
          onBlur={() => {}}
          ></NumberInput>
        </div>        
        <div className="modal-action bg-gray-100 px-4 py-6">
          <label htmlFor={`modal-${order.code}`} className="btn btn-primary text-white w-full"
          onClick={onPalletPrint}>Print label</label>
        </div>
      </div>
    </div>

    {/* Print menu */}     
    <div className="dropdown dropdown-end z-0">
      <label tabIndex={0} className="btn btn-ghost btn-circle bg-gray-100 text-gray-500">
        <BiPrinter className="inline-block w-6 h-6"></BiPrinter>
      </label>
      <ul tabIndex={0} className="dropdown-content menu p-2 shadow-md border border-gray-300 bg-base-100 rounded-box w-36">
        <li>
          <a onClick={handleOrderPrint}>
            <span>Packing Slip</span>
          </a>
        </li>
        <li>
          <label htmlFor={`modal-${order.code}`}>
            <span>Pallet Label</span>
          </label>     
        </li>
      </ul>
    </div>  
  </>
  );
}