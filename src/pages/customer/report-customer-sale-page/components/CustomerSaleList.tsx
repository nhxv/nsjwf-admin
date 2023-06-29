import csvDownload from "json-to-csv-export";
import { useMemo } from "react";
import { BiDownload, BiRotateLeft } from "react-icons/bi";
import { PaymentStatus } from "../../../../commons/enums/payment-status.enum";
import { Role } from "../../../../commons/enums/role.enum";
import {
  convertTime,
  convertTimeToText,
} from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import StatusTag from "../../../../components/StatusTag";
import api from "../../../../stores/api";
import { useAuthStore } from "../../../../stores/auth.store";
import { useNavigate } from "react-router-dom";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import { ACTION_TYPE } from "../../../../commons/hooks/report-sale.hook";

export default function CustomerSaleList({ stateReducer, dispatch }) {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const total = useMemo(() => {
    let cash = 0;
    let check = 0;
    let receivable = 0;
    for (const report of stateReducer.reports) {
      if (report.paymentStatus === PaymentStatus.CASH) {
        cash += parseFloat(report.sale) - parseFloat(report.refund);
      } else if (report.paymentStatus === PaymentStatus.CHECK) {
        check += parseFloat(report.sale) - parseFloat(report.refund);
      } else if (report.paymentStatus === PaymentStatus.RECEIVABLE) {
        receivable += parseFloat(report.sale) - parseFloat(report.refund);
      }
    }
    return { cash: cash, check: check, receivable: receivable };
  }, [stateReducer.reports]);

  const onDownloadReport = () => {
    const reportData = stateReducer.reports.map((report) => ({
      // For these 2 dates, most of the time, they'll be the same since the app only allows
      // user to view orders that are completed today. However, to respect data, we'll
      // use report.date instead of Date.now().
      // In the case of receivable, we also put the date the same (as of my knowledge).
      order_date: convertTime(new Date(report.updatedAt)),
      payment_date: convertTime(new Date(report.updatedAt)),
      customer: report.customerName,
      code: `${report.manualCode ? report.manualCode : report.orderCode}`,
      sale: parseFloat(report.sale) - report.refund,
      test: report.isTest ? "S" : "L",
      payment_status:
        report.paymentStatus === "RECEIVABLE" ? "AR" : report.paymentStatus,
    }));
    const saleFile = {
      data: reportData,
      filename: `${convertTime(new Date()).split("-").join("")}_report`,
      delimiter: ",",
      headers: [
        "Order Date",
        "Payment Date",
        "Customer",
        "Order No.",
        "Sale",
        "Type",
        "Payment Method",
      ],
    };
    csvDownload(saleFile);
  };

  const onUpdatePayment = (status: string, code: string) => {
    dispatch({
      type: ACTION_TYPE.LOADING,
    });

    const reqData = {
      status: status,
    };
    api
      .put(`/customer-payment/status/${code}`, reqData)
      .then((_) => {
        dispatch({
          type: ACTION_TYPE.TRIGGER_RELOAD,
        });
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );

        if (error.status === 401) {
          handleTokenExpire(navigate, dispatch, (_, msg) => ({
            type: ACTION_TYPE.ERROR,
            error: msg,
          }));
        } else {
          dispatch({
            type: ACTION_TYPE.ERROR,
            error: error.message,
          });
          setTimeout(() => {
            dispatch({
              type: ACTION_TYPE.TRIGGER_RELOAD,
            });
          }, 2000);
        }
      });
  };

  const onRevert = (code: string) => {
    api
      .put(`/customer-orders/revert/${code}`)
      .then((res) => {
        dispatch({
          type: ACTION_TYPE.REVERT_ORDER,
          code: code,
        });
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );

        if (error.status === 401) {
          handleTokenExpire(navigate, dispatch, (_, msg) => ({
            type: ACTION_TYPE.ERROR,
            error: msg,
          }));
        } else {
          dispatch({
            type: ACTION_TYPE.ERROR,
            error: error.message,
          });

          setTimeout(() => {
            dispatch({
              type: ACTION_TYPE.TRIGGER_RELOAD,
            });
          }, 2000);
        }
      });
  };

  const onReturn = (code: string) => {
    navigate(`/customer/create-customer-return/${code}`);
  };

  if (stateReducer.loading) {
    return <Spinner></Spinner>;
  }

  // If it errors and it's not empty then we display it on the sale card, not clear the entire screen.
  if (stateReducer.error && stateReducer.empty) {
    return <Alert message={stateReducer.error} type="error"></Alert>;
  }

  if (stateReducer.empty) {
    return <Alert message={stateReducer.empty} type="empty"></Alert>;
  }

  return (
    <>
      <div className="mb-6 flex flex-col items-center justify-between gap-3 xl:flex-row">
        <div className="flex gap-2">
          <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
            ${total.cash} in cash
          </div>
          <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
            ${total.check} in check
          </div>
          <div className="rounded-btn flex items-center bg-warning p-2 text-sm font-semibold text-warning-content">
            ${total.receivable} in A/R
          </div>
        </div>

        <button className="btn-accent btn" onClick={onDownloadReport}>
          <span className="mr-2">Download report</span>
          <BiDownload className="h-6 w-6"></BiDownload>
        </button>
      </div>
      {stateReducer.reports.map((report) => {
        return (
          <div key={report.orderCode} className="custom-card mb-8">
            {/* basic report info */}
            <div className="flex flex-row justify-between">
              <div>
                <p>
                  #{report.manualCode ? report.manualCode : report.orderCode}
                </p>
                <p className="text-xl font-semibold">{report.customerName}</p>
                <p className="text-sm text-neutral">
                  Completed at {convertTimeToText(new Date(report.updatedAt))}
                </p>
                <div className="mt-5">
                  <StatusTag status={report.paymentStatus}></StatusTag>
                </div>
              </div>
              {(role === Role.ADMIN || role === Role.MASTER) && (
                <div className="dropdown-end dropdown">
                  <label tabIndex={0} className="btn-accent btn-circle btn">
                    <BiRotateLeft className="h-6 w-6 text-error-content"></BiRotateLeft>
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu rounded-box w-40 border-2 border-base-300 bg-base-100 p-2 shadow-md dark:bg-base-200"
                  >
                    <li className="">
                      <a
                        onClick={() => onReturn(report.orderCode)}
                        className="flex justify-center text-base-content hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"
                      >
                        <span>Create Return</span>
                      </a>
                    </li>
                    <li>
                      <a
                        onClick={() => onRevert(report.orderCode)}
                        className="flex justify-center text-base-content hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"
                      >
                        <span>Revert Order</span>
                      </a>
                    </li>
                  </ul>
                </div>
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
            {report.productCustomerOrders.map((productOrder) => {
              return (
                <div
                  key={`${productOrder.productName}_${productOrder.unitCode}`}
                  className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3 dark:bg-base-300"
                >
                  <div className="ml-3 w-6/12">
                    <span>{productOrder.productName}</span>
                  </div>
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
            <div className="divider"></div>
            <div className="mt-2 flex items-center">
              <span className="mr-2">Total:</span>
              <span className="mr-2 text-xl font-medium">${report.sale}</span>
              <span className="text-red-600">-${report.refund}</span>
            </div>
            <div className="mt-5 grid grid-cols-12 gap-3">
              <button
                className="btn-outline-primary btn col-span-6 w-full"
                onClick={() =>
                  onUpdatePayment(PaymentStatus.CHECK, report.orderCode)
                }
              >
                Check
              </button>
              <button
                type="button"
                className="btn-primary btn col-span-6 w-full"
                onClick={() =>
                  onUpdatePayment(PaymentStatus.CASH, report.orderCode)
                }
              >
                Cash
              </button>
            </div>
            <button
              type="button"
              className="btn-accent btn mt-3 w-full"
              onClick={() =>
                onUpdatePayment(PaymentStatus.RECEIVABLE, report.orderCode)
              }
            >
              Receivable
            </button>

            <div>
              {stateReducer.loading && (
                <div className="mt-5">
                  <Spinner></Spinner>
                </div>
              )}
              {stateReducer.error && (
                <div className="mt-5">
                  <Alert message={stateReducer.error} type="error"></Alert>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
