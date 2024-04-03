import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";
import { convertTimeToText } from "../../../../commons/utils/time.util";
import Modal from "../../../../components/Modal";
import StatusTag from "../../../../components/StatusTag";

export default function SaleDetailModal({ isOpen, onClose, report }) {

  const onModalClose = () => {
    // setChangeBuffer(transformReport());
    onClose();
  };

  // Need this because when first loading the page, no reports are available.
  if (!report) return;
  return (
    <Modal isOpen={isOpen} onClose={onModalClose}>
      <div key={report.orderCode} className="custom-card text-left">
        {/* basic report info */}
        <div className="flex flex-row justify-between">
          <div>
            <p>#{report.orderCode}</p>
            <p className="text-xl font-semibold">{report.vendorName}</p>
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
              <label className="btn btn-circle btn-accent">
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
        <div className="max-h-48 overflow-y-auto overflow-x-hidden xl:max-h-72">
          {report.productVendorOrders.map((productOrder) => {
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
                  <span>${niceVisualDecimal(productOrder.unitPrice)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="divider"></div>
        <div className="mt-2 flex items-center">
          <span className="mr-2">Total:</span>
          <span className="mr-2 text-xl font-medium">
            ${niceVisualDecimal(report.sale)}
          </span>
        </div>
      </div>
    </Modal>
  );
}
