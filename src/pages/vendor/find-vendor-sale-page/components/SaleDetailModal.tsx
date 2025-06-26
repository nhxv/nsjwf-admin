import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";
import { convertTimeToText } from "../../../../commons/utils/time.util";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import Modal from "../../../../components/Modal";
import StatusTag from "../../../../components/StatusTag";
import api from "../../../../stores/api";
import { useAuthStore } from "../../../../stores/auth.store";
import { Menu } from "@headlessui/react";
import { BiRotateLeft } from "react-icons/bi";
import { Role } from "../../../../commons/enums/role.enum";
import TextInput from "../../../../components/forms/TextInput";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";

function productOrderID(productOrder) {
  return `${productOrder.productName}_${productOrder.unitCode}`;
}

export default function SaleDetailModal({ isOpen, onClose, report }) {
  const role = useAuthStore((state) => state.role);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const transformReport = () => {
    let priceChangeBuffer = {};
    if (report) {
      for (const po of report.productVendorOrders) {
        priceChangeBuffer[productOrderID(po)] = {
          ...po,
          // Suppress null input value warning.
          unitPrice: po.unitPrice || "",
        };
      }
    }
    return priceChangeBuffer;
  };

  const [changeBuffer, setChangeBuffer] = useState(transformReport());

  const queryClient = useQueryClient();
  const saleRevertMut = useMutation({
    mutationFn: (code: string) => {
      return api.put(`/vendor-orders/revert/${code}`);
    },
    onSuccess: () => {
      // Here we don't have a clean way to access the queryURL
      // to identify the query, so we have to use this roundabout way like this.
      // NOTE: If we have the queryURL, we can skip the invalidation
      // and instead update the cache via queryClient.setQueryData(), which save 1 api call.
      queryClient.invalidateQueries({
        predicate: (query) => {
          const keys = query.queryKey as Array<string>;
          return keys[0] === "reports" && keys[1]?.startsWith("reports=");
        },
      });
      onClose();
    },
    onError: (err: any) => {
      let _error = JSON.parse(
        JSON.stringify(err.response ? err.response.data.error : err)
      );
      if (_error.status === 401) {
        handleTokenExpire(navigate, setError, (msg) => msg);
      } else {
        setError(_error.message);
        setTimeout(() => {
          setError("");
        }, 2000);
      }
      saleRevertMut.reset();
    },
  });
  const saleUpdateMut = useMutation({
    mutationFn: (code: string) => {
      return api.put(`/vendor-orders/update/${code}`);
    },
    onSuccess: () => {
      // Here we don't have a clean way to access the queryURL
      // to identify the query, so we have to use this roundabout way like this.
      // NOTE: If we have the queryURL, we can skip the invalidation
      // and instead update the cache via queryClient.setQueryData(), which save 1 api call.
      queryClient.invalidateQueries({
        predicate: (query) => {
          const keys = query.queryKey as Array<string>;
          return keys[0] === "reports" && keys[1]?.startsWith("reports=");
        },
      });
      onClose();
    },
    onError: (err: any) => {
      let _error = JSON.parse(
        JSON.stringify(err.response ? err.response.data.error : err)
      );
      if (_error.status === 401) {
        handleTokenExpire(navigate, setError, (msg) => msg);
      } else {
        setError(_error.message);
        setTimeout(() => {
          setError("");
        }, 2000);
      }
      saleRevertMut.reset();
    },
  });

  const onRevert = (code: string) => {
    saleRevertMut.mutate(code);
  };

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
            <p>#{report.manualCode ?? report.orderCode}</p>
            <p className="text-xl font-semibold">{report.vendorName}</p>
            <p className="text-sm text-neutral">
              Delivered at {convertTimeToText(new Date(report.expectedAt))}
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
                  {false && (role === Role.ADMIN || role === Role.MASTER) ? (
                    <TextInput
                      id={productOrderID(productOrder)}
                      name={productOrderID(productOrder)}
                      placeholder={null}
                      value={
                        changeBuffer[productOrderID(productOrder)].unitPrice
                      }
                      onChange={(e) => {
                        const k = productOrderID(productOrder);
                        setChangeBuffer((prev) => ({
                          ...prev,
                          // Computed Property Name
                          [k]: {
                            ...prev[k],
                            unitPrice: e.target.value,
                          },
                        }));
                      }}
                    />
                  ) : (
                    <span>
                      {productOrder.unitPrice
                        ? "$" + niceVisualDecimal(productOrder.unitPrice)
                        : ""}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="divider"></div>
        <div className="my-2 flex items-center">
          <span className="mr-2">Total:</span>
          <span className="mr-2 text-xl font-medium">
            ${niceVisualDecimal(report.sale)}
          </span>
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={() =>
            navigate(`/vendor/view-vendor-order-detail/${report.orderCode}`)
          }
        >
          View Detail
        </button>

        <div>
          {saleRevertMut.status === "pending" && (
            <div className="mt-5">
              <Spinner></Spinner>
            </div>
          )}
          {error && (
            <div className="mt-5">
              <Alert message={error} type="error"></Alert>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
