import { useReactToPrint } from "react-to-print";
import { useRef, useState, useEffect } from "react";
import { BiPrinter, BiX } from "react-icons/bi";
import NumberInput from "../../../../components/forms/NumberInput";
import PalletLabelToPrint from "./PalletLabelToPrint";
import PackingSlipToPrint from "./PackingSlipToPrint";
import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";

export default function CustomerOrderPrint({ order, displayError }) {
  const [pallet, setPallet] = useState({count: 1, list: [null]});
  const palletLabelToPrintRef = useRef<HTMLDivElement>(null);
  const handlePalletPrint = useReactToPrint({
    content: () => palletLabelToPrintRef.current,
  });

  const orderToPrintRef = useRef<HTMLDivElement>(null);
  const handleOrderPrint = useReactToPrint({
    content: () => orderToPrintRef.current,
  });

  const onPalletPrint = async () => {
    if (pallet.count < 1 || pallet.list.length < 1) {
      return;
    }
    let errorMessage = "";
    try {
      errorMessage = "fail when try setup printer";
      console.log(errorMessage);
      const browserPrint = new ZebraBrowserPrintWrapper();
      errorMessage = "fail when try to get default printer";
      console.log(errorMessage);
      const defaultPrinter = await browserPrint.getDefaultPrinter();
      browserPrint.setPrinter(defaultPrinter);
      errorMessage = "fail after set printer?";
      console.log(errorMessage);
      browserPrint.print("hello world");
    } catch (e) {
      console.log("hello general error");
      displayError(errorMessage);
      throw new Error(e);
    }
    // handlePalletPrint();
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
      <PackingSlipToPrint printRef={orderToPrintRef} order={order} />
      <PalletLabelToPrint printRef={palletLabelToPrintRef} pallet={pallet} order={order} />
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
          <label htmlFor="name" className="custom-label inline-block mb-2">
            <span>Number of pallet</span>
            <span className="text-red-500">*</span>
          </label>
          <NumberInput id="pallet" name="pallet" placeholder={`Number of Pallet`} 
          value={pallet.count} min={1} max={100} disabled={false}
          onChange={onChange}></NumberInput>
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