import { BiRotateLeft } from "react-icons/bi";
import { Role } from "../../../../commons/enums/role.enum";
import { convertTimeToText } from "../../../../commons/utils/time.util";
import Modal from "../../../../components/Modal";
import StatusTag from "../../../../components/StatusTag";
import { useAuthStore } from "../../../../stores/auth.store";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { Menu } from "@headlessui/react";
import { ACTION_TYPE } from "../../../../commons/hooks/report-sale.hook";
import { handleTokenExpire } from "../../../../commons/utils/token.util";

export default function SaleDetailModal({ isOpen, onClose, report, dispatch }) {
  const role = useAuthStore((state) => state.role);
  const navigate = useNavigate();
  const [state, setState] = useState({
    // By default, nothing to load.
    loading: false,
    error: "",
  });

  const onRevert = (code: string) => {
    setState((prev) => ({
      ...prev,
      loading: true,
    }));

    api
      .put(`/customer-orders/revert/${code}`)
      .then((res) => {
        dispatch({
          type: ACTION_TYPE.REVERT_ORDER,
          code: code,
        });
        setState((prev) => ({
          ...prev,
          loading: false,
        }));
        onClose();
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );

        if (error.status === 401) {
          handleTokenExpire(navigate, dispatch, (msg) => ({
            type: ACTION_TYPE.ERROR,
            error: msg,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: error.message,
            loading: false,
          }));
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              error: "",
            }));
          }, 2000);
        }
      });
  };

  const onReturn = (code: string) => {
    navigate(`/customer/create-customer-return/${code}`);
  };

  // Need this because when first loading the page, no reports are available.
  if (!report) return;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div key={report.orderCode} className="custom-card text-left">
        {/* basic report info */}
        <div className="flex flex-row justify-between">
          <div>
            <p>#{report.manualCode ? report.manualCode : report.orderCode}</p>
            <p className="text-xl font-semibold">{report.customerName}</p>
            <p className="text-sm text-neutral">
              Completed at {convertTimeToText(new Date(report.updatedAt))}
            </p>
            <div className="mt-5">
              <StatusTag status={report.paymentStatus}></StatusTag>
            </div>
          </div>
          {/* Padding div to stretch the modal horizontally */}
          <div className="w-72"></div>

          {(role === Role.ADMIN || role === Role.MASTER) && (
            // Need to be div for the btn and dropdown to align correctly.
            <Menu as="div">
              <label className="btn-accent btn-circle btn">
                <Menu.Button>
                  <BiRotateLeft className="h-6 w-6 text-error-content"></BiRotateLeft>
                </Menu.Button>
              </label>
              <Menu.Items
                as="div"
                // Magik
                className="menu rounded-box absolute right-6 w-40 origin-top-right border-2 border-base-300 bg-base-100 p-2 shadow-md dark:bg-base-200"
              >
                <Menu.Item>
                  <button
                    className={
                      "flex justify-center rounded-md p-3 text-base-content ui-active:bg-base-200 ui-active:dark:bg-base-300"
                    }
                    onClick={() => onReturn(report.orderCode)}
                  >
                    Create Return
                  </button>
                </Menu.Item>
                <Menu.Item>
                  <button
                    className={
                      "flex justify-center rounded-md p-3 text-base-content ui-active:bg-base-200 ui-active:dark:bg-base-300"
                    }
                    onClick={() => onRevert(report.orderCode)}
                  >
                    Revert Order
                  </button>
                </Menu.Item>
              </Menu.Items>
            </Menu>
          )}
        </div>
        <div className="divider"></div>
        {/* products in report */}
        <div className="mb-2 flex items-center">
          <div className="w-6/12">
            <span className="font-medium">Product</span>
          </div>
          <div className="w-3/12 text-center">
            <span className="font-medium">Qty</span>
          </div>
          <div className="w-3/12 text-center">
            <span className="font-medium">Price</span>
          </div>
        </div>
        <div className="max-h-48 overflow-auto xl:max-h-72">
          {report.productCustomerOrders.map((productOrder) => {
            return (
              <div
                key={`${productOrder.productName}_${productOrder.unitCode}`}
                className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3 dark:bg-base-300"
              >
                <div className="ml-3 w-6/12">{productOrder.productName}</div>
                <div className="w-3/12 text-center">
                  <span>
                    {productOrder.quantity}{" "}
                    {productOrder.unitCode === "box"
                      ? ``
                      : `(${productOrder.unitCode})`}
                  </span>
                </div>
                <div className="w-3/12 text-center">
                  <span>${productOrder.unitPrice}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="divider"></div>
        <div className="mt-2 flex items-center">
          <span className="mr-2">Total:</span>
          <span className="mr-2 text-xl font-medium">${report.sale}</span>
          <span className="text-red-600">-${report.refund}</span>
        </div>

        <div>
          {state.loading && (
            <div className="mt-5">
              <Spinner></Spinner>
            </div>
          )}
          {state.error && (
            <div className="mt-5">
              <Alert message={state.error} type="error"></Alert>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
