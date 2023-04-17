import { useRef, useState } from "react";
import { BiPrinter, BiX } from "react-icons/bi";
import { useReactToPrint } from "react-to-print";
import NumberInput from "../../../../components/forms/NumberInput";
import Modal from "../../../../components/Modal";
import PackingSlipToPrint from "./PackingSlipToPrint";
import PalletLabelToPrint from "./PalletLabelToPrint";

export default function CustomerOrderPrint({ order }) {
  const [pallet, setPallet] = useState({ count: 1, list: [null] });
  const palletLabelToPrintRef = useRef<HTMLDivElement>(null);
  const handlePalletPrint = useReactToPrint({
    content: () => palletLabelToPrintRef.current,
  });
  const [isOpen, setIsOpen] = useState(false);

  const orderToPrintRef = useRef<HTMLDivElement>(null);
  const handleOrderPrint = useReactToPrint({
    content: () => orderToPrintRef.current,
  });

  const onPalletPrint = () => {
    onCloseModal();
    if (pallet.count < 1 || pallet.list.length < 1) {
      return;
    }
    handlePalletPrint();
  };

  const onChange = (e) => {
    const newArr = [];
    for (let i = 0; i < e.target.value; i++) {
      newArr.push(null);
    }
    setPallet((prev) => ({ ...prev, count: e.target.value, list: newArr }));
  };

  const onCloseModal = () => {
    setIsOpen(false);
  };

  const onOpenModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className="hidden">
        <PackingSlipToPrint printRef={orderToPrintRef} order={order} />
        <PalletLabelToPrint
          printRef={palletLabelToPrintRef}
          pallet={pallet}
          order={order}
        />
      </div>

      {/* Pallet modal */}
      <Modal isOpen={isOpen} onClose={onCloseModal}>
        <div className="custom-card text-left">
          <div className="flex justify-end">
            <button
              className="btn-accent btn-sm btn-circle btn"
              onClick={onCloseModal}
            >
              <BiX className="h-6 w-6"></BiX>
            </button>
          </div>
          <div className="mb-5">
            <label htmlFor="name" className="custom-label mb-2 inline-block">
              <span>Number of pallet</span>
              <span className="text-red-500">*</span>
            </label>
            <NumberInput
              id="pallet"
              placeholder={`Number of Pallet`}
              min={1}
              max={100}
              name="pallet"
              value={pallet.count}
              onChange={onChange}
            ></NumberInput>
          </div>
          <button className="btn-primary btn w-full" onClick={onPalletPrint}>
            Print label
          </button>
        </div>
      </Modal>

      {/* Print menu */}
      <div className="dropdown-end dropdown z-0">
        <label
          tabIndex={0}
          className="btn-ghost btn-circle btn bg-base-200 text-neutral dark:bg-base-300 dark:text-neutral-content"
        >
          <BiPrinter className="h-6 w-6"></BiPrinter>
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu rounded-box w-36 border-2 border-base-300 bg-base-100 p-2 shadow-md dark:bg-base-200"
        >
          <li>
            <a
              onClick={handleOrderPrint}
              className="text-base-content hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"
            >
              <span>Packing Slip</span>
            </a>
          </li>
          <li>
            <a
              onClick={onOpenModal}
              className="text-base-content hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"
            >
              <span>Pallet Label</span>
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
