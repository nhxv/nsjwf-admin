import { useRef, useState } from "react";
import { BiPrinter, BiX } from "react-icons/bi";
import { useReactToPrint } from "react-to-print";
import Modal from "../../../../components/Modal";
import PackingSlipToPrint from "./PackingSlipToPrint";
import NumberInput from "../../../../components/forms/NumberInput";
import InvoiceToPrint from "./InvoiceToPrint";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../stores/api";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";

interface IOrderStatusMutation {
  code: string;
  newStatus: OrderStatus;
}

export default function CustomerOrderPrint({ order }) {
  const [pallet, setPallet] = useState({ count: 1, list: [null] });
  const palletLabelToPrintRef = useRef<HTMLDivElement>(null);
  const handlePalletPrint = useReactToPrint({
    content: () => palletLabelToPrintRef.current,
  });
  const [isPalletModalOpen, setIsPalletModalOpen] = useState(false);

  const orderPrintAsPackingSlipRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const orderStatusMut = useMutation({
    mutationFn: (data: IOrderStatusMutation) => {
      return api.patch("customer-orders/status", null, {
        params: {
          code: data.code,
          status: data.newStatus,
        },
      });
    },
    onSuccess: (response) => {
      const newCustomerOrder = response.data;
      queryClient.setQueryData(
        ["customer-orders", order.code],
        newCustomerOrder
      );
    },
    onError: () => {
      // Aside from param-related errors, there's also COMPLETED order
      // and such so when that happens we reload the page.
      // Return is kinda nice here because it'll wait for the invalidation to complete.
      // ...or at least according to this https://tkdodo.eu/blog/mastering-mutations-in-react-query#awaited-promises
      return queryClient.invalidateQueries({
        queryKey: ["customer-orders", order.code],
      });
    },
  });
  const handlePackingSlipPrint = useReactToPrint({
    content: () => orderPrintAsPackingSlipRef.current,
    onAfterPrint: () => {
      if (order.status === OrderStatus.PICKING) {
        orderStatusMut.mutate({
          code: order.code,
          newStatus: OrderStatus.CHECKING,
        });
      }
    },
  });

  const orderPrintAsInvoiceRef = useRef<HTMLDivElement>(null);
  const handleInvoicePrint = useReactToPrint({
    content: () => orderPrintAsInvoiceRef.current,
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
    setIsPalletModalOpen(false);
  };

  const onOpenModal = () => {
    setIsPalletModalOpen(true);
  };

  return (
    <>
      <div className="hidden">
        <PackingSlipToPrint
          printRef={orderPrintAsPackingSlipRef}
          order={order}
        />
        <InvoiceToPrint printRef={orderPrintAsInvoiceRef} order={order} />
      </div>

      {/* Pallet modal */}
      <Modal isOpen={isPalletModalOpen} onClose={onCloseModal}>
        <div className="custom-card text-left">
          <div className="flex justify-end">
            <button
              className="btn btn-circle btn-accent btn-sm"
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
          <button className="btn btn-primary w-full" onClick={onPalletPrint}>
            Print label
          </button>
        </div>
      </Modal>

      {/* Print menu */}
      <div className="dropdown dropdown-end z-0">
        <label
          tabIndex={0}
          className="btn btn-circle btn-ghost bg-base-200 text-neutral dark:bg-base-300 dark:text-neutral-content"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <BiPrinter className="h-6 w-6"></BiPrinter>
        </label>

        <ul
          tabIndex={0}
          className="dropdown-content menu rounded-box w-36 border-2 border-base-300 bg-base-100 p-2 shadow-md dark:bg-base-200"
        >
          <li>
            <a
              onClick={(e) => {
                e.stopPropagation();
                handlePackingSlipPrint();
              }}
              className="text-base-content hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"
            >
              <span>Packing Slip</span>
            </a>
          </li>
          <li>
            <a
              onClick={(e) => {
                e.stopPropagation();
                handleInvoicePrint();
              }}
              className="text-base-content hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"
            >
              <span>Invoice</span>
            </a>
            {/* <a
              onClick={onOpenModal}
              className="text-base-content hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"
            >
              <span>Pallet Label</span>
            </a> */}
          </li>
        </ul>
      </div>
    </>
  );
}
