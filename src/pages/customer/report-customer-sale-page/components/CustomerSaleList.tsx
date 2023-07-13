import csvDownload from "json-to-csv-export";
import { useMemo, useState } from "react";
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
import SaleDetailModal from "./SaleDetailModal";

export default function CustomerSaleList({
  stateReducer,
  dispatch,
  onSelectSale,
}) {
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
  const [_modal, setModal] = useState({
    isOpen: false,
  });

  const onDownloadReport = () => {
    // Download from oldest to latest.
    const reports = stateReducer.oldest_first
      ? stateReducer.reports
      : stateReducer.reports.toReversed();
    const reportData = reports.map((report) => ({
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
          handleTokenExpire(navigate, dispatch, (msg) => ({
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

  if (stateReducer.loading) {
    return <Spinner></Spinner>;
  }

  // If it errors and it's not empty then we display it on the sale card, not clear the entire screen.
  // We need to do an explicit check on reports because setting .error will set .empty to falsy (not empty).
  if (stateReducer.error && stateReducer.reports.length === 0) {
    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <Alert message={stateReducer.error} type="error"></Alert>
      </div>
    );
  }

  if (stateReducer.empty) {
    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <Alert message={stateReducer.empty} type="empty"></Alert>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col items-center justify-between gap-3 xl:flex-row">
        <div className="flex gap-2">
          <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
            ${total.check} in check
          </div>
          <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
            ${total.cash} in cash
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
      <div className="grid grid-cols-12 gap-2">
        {stateReducer.reports.map((report) => (
          <div
            key={report.orderCode}
            className={`rounded-box col-span-12 border-2 p-3 shadow-md hover:cursor-pointer sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2
            ${
              report.paymentStatus === PaymentStatus.CASH
                ? "border-primary bg-green-100 text-primary dark:border-primary dark:bg-green-700 dark:bg-opacity-10"
                : report.paymentStatus === PaymentStatus.CHECK
                ? "dark:primary border-neutral bg-base-100 dark:bg-transparent"
                : "border-yellow-700 bg-yellow-100 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900 dark:bg-opacity-10"
            }`}
            onClick={() => {
              setModal({ isOpen: true });
              onSelectSale(report);
            }}
          >
            <div>
              #{report.manualCode ? report.manualCode : report.orderCode}
            </div>
            <div className="font-semibold">{report.customerName}</div>
            <div className="text-sm">
              {convertTimeToText(new Date(report.updatedAt))}
            </div>
            <div className="">${report.sale - report.refund}</div>
            <div className="mt-3 grid grid-cols-12 gap-3">
              {report.paymentStatus !== PaymentStatus.CHECK && (
                <button
                  className="btn-outline-primary btn-sm btn col-span-6 w-full bg-white dark:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdatePayment(PaymentStatus.CHECK, report.orderCode);
                  }}
                >
                  Check
                </button>
              )}
              {report.paymentStatus !== PaymentStatus.CASH && (
                <button
                  type="button"
                  className="btn-primary btn-sm btn col-span-6 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdatePayment(PaymentStatus.CASH, report.orderCode);
                  }}
                >
                  Cash
                </button>
              )}
              {report.paymentStatus !== PaymentStatus.RECEIVABLE && (
                <button
                  type="button"
                  className="btn-accent btn-sm btn col-span-6 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdatePayment(PaymentStatus.RECEIVABLE, report.orderCode);
                  }}
                >
                  AR
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
