import csvDownload from "json-to-csv-export";
import { useEffect, useMemo, useState } from "react";
import { BiDownload, BiRevision } from "react-icons/bi";
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

export default function CustomerSaleList() {
  const [fetchData, setFetchData] = useState({
    reports: [],
    display: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [paymentState, setPaymentState] = useState({
    loading: false,
    error: "",
  });
  const role = useAuthStore((state) => state.role);
  const [reload, setReload] = useState(false);
  const total = useMemo(() => {
    let cash = 0;
    let check = 0;
    let receivable = 0;
    for (const report of fetchData.reports) {
      if (report.payment_status === PaymentStatus.CASH) {
        cash += parseFloat(report.sale);
      } else if (report.payment_status === PaymentStatus.CHECK) {
        check += parseFloat(report.sale);
      } else if (report.payment_status === PaymentStatus.RECEIVABLE) {
        receivable += parseFloat(report.sale);
      }
    }
    return { cash: cash, check: check, receivable: receivable };
  }, [fetchData.reports]);

  useEffect(() => {
    getReportData();
    // re-render after 1 min
    const reRender = setInterval(() => {
      getReportData();
    }, 60000);

    return () => {
      clearInterval(reRender);
    };
  }, [reload]);

  const getReportData = () => {
    api
      .get(`/customer-orders/sold/report`)
      .then((res) => {
        if (res.data.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            reports: [],
            display: [],
            empty: "Such hollow, much empty...",
            error: "",
            loading: false,
          }));
        } else {
          setFetchData((prev) => ({
            ...prev,
            reports: res.data,
            display: res.data.filter((report) => report.sale > 0),
            error: "",
            empty: "",
            loading: false,
          }));
        }
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFetchData((prev) => ({
          ...prev,
          reports: [],
          display: [],
          error: error.message,
          empty: "",
          loading: false,
        }));
      });
  };

  const onDownloadReport = () => {
    const reportData = fetchData.reports.map((report) => ({
      code: `#${report.manual_code ? report.manual_code : report.order_code}`,
      customer: report.customer_name,
      date: convertTime(new Date(report.date)),
      sale: parseFloat(report.sale),
      refund: parseFloat(report.refund),
      payment_status: report.payment_status,
      test: report.is_test ? "S" : "L",
      cash: 0,
      check: 0,
      receivable: 0,
    }));
    reportData[0]["cash"] = total.cash;
    reportData[0]["check"] = total.check;
    reportData[0]["receivable"] = total.receivable;
    const saleFile = {
      data: reportData,
      filename: `${convertTime(new Date()).split("-").join("")}_report`,
      delimiter: ",",
      headers: [
        "Order",
        "Customer",
        "Date",
        "Sale",
        "Refund",
        "Payment",
        "Type",
        "Cash",
        "Check",
        "Receivable",
      ],
    };
    csvDownload(saleFile);
  };

  const onReload = () => {
    setReload(!reload);
    setFetchData((prev) => ({
      ...prev,
      error: "",
      empty: "",
      loading: true,
    }));
  };

  const onUpdatePayment = (status: string, code: string) => {
    setPaymentState((prev) => ({ ...prev, loading: true, error: "" }));
    const reqData = {
      status: status,
    };
    api
      .put(`/customer-payment/status/${code}`, reqData)
      .then((res) => {
        setPaymentState((prev) => ({ ...prev, loading: false, error: "" }));
        onReload();
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setPaymentState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
        setTimeout(() => {
          setPaymentState((prev) => ({ ...prev, error: "", loading: false }));
          onReload();
        }, 2000);
      });
  };

  const onRevert = (code: string) => {
    api
      .put(`/customer-orders/revert/${code}`)
      .then((res) => {
        setPaymentState((prev) => ({ ...prev, loading: false, error: "" }));
        onReload();
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setPaymentState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
        setTimeout(() => {
          setPaymentState((prev) => ({ ...prev, error: "", loading: false }));
          onReload();
        }, 2000);
      });
  };

  if (fetchData.loading) {
    return <Spinner></Spinner>;
  }

  if (fetchData.error) {
    return <Alert message={fetchData.error} type="error"></Alert>;
  }

  if (fetchData.empty) {
    return <Alert message={fetchData.empty} type="empty"></Alert>;
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

        <button
          type="button"
          className="btn-accent btn"
          onClick={onDownloadReport}
        >
          <span className="mr-2">Download report</span>
          <BiDownload className="h-6 w-6"></BiDownload>
        </button>
      </div>
      {fetchData.reports.map((report) => {
        return (
          <div key={report.order_code} className="custom-card mb-8">
            {/* basic report info */}
            <div className="flex flex-row justify-between">
              <div>
                <p>
                  #{report.manual_code ? report.manual_code : report.order_code}
                </p>
                <p className="text-xl font-semibold">{report.customer_name}</p>
                <p className="text-sm text-neutral">
                  Completed at {convertTimeToText(new Date(report.date))}
                </p>
                <div className="mt-5">
                  <StatusTag status={report.payment_status}></StatusTag>
                </div>
              </div>
              {role === Role.MASTER && (
                <button
                type="button"
                className="btn-ghost btn-circle btn bg-base-200 text-neutral dark:bg-base-300 dark:text-neutral-content"
                onClick={() => onRevert(report.order_code)}
                >
                  <BiRevision className="h-6 w-6"></BiRevision>
                </button>
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
                  key={productOrder.unit_code}
                  className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3 dark:bg-base-300"
                >
                  <div className="ml-3 w-6/12">
                    <span>{productOrder.product_name}</span>
                  </div>
                  <div className="w-3/12 text-center">
                    <span>
                      {productOrder.quantity} (
                      {productOrder.unit_code.split("_")[1].toLowerCase()})
                    </span>
                  </div>
                  <div className="w-3/12 text-center">
                    <span>${productOrder.unit_price}</span>
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
                type="button"
                className="btn-outline-primary btn col-span-6 w-full"
                onClick={() =>
                  onUpdatePayment(PaymentStatus.CHECK, report.order_code)
                }
              >
                Check
              </button>
              <button
                type="button"
                className="btn-primary btn col-span-6 w-full"
                onClick={() =>
                  onUpdatePayment(PaymentStatus.CASH, report.order_code)
                }
              >
                Cash
              </button>
            </div>
            <button
              type="button"
              className="btn-accent btn mt-3 w-full"
              onClick={() => onUpdatePayment(PaymentStatus.RECEIVABLE, report.order_code)}
            >
              Receivable
            </button>
            <div>
              {paymentState.loading && (
                <div className="mt-5">
                  <Spinner></Spinner>
                </div>
              )}
              {paymentState.error && (
                <div className="mt-5">
                  <Alert message={paymentState.error} type="error"></Alert>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
