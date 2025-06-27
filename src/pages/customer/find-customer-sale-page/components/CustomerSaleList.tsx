import csvDownload from "json-to-csv-export";
import { useMemo, useState } from "react";
import { BiDownload, BiExport, BiPin, BiSolidPin } from "react-icons/bi";
import { PaymentStatus } from "../../../../commons/enums/payment-status.enum";
import {
  convertTime,
  convertTimeToText,
} from "../../../../commons/utils/time.util";
import Alert, { AlertFromQueryError } from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { useNavigate } from "react-router-dom";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import {
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";

interface CustomerSaleListProps {
  reports: Array<any>;
  reportQuery: UseQueryResult<any>;
  onSelectSale: (sale: any) => void;
}

// Mutation doesn't accept more than 1 param so here we are.
interface PaymentMethodMutationParam {
  code: string;
  status: string;
}

// Some customers we can't directly change the name to match qb.
// An example would be the C customer.
// It's not the job of the app to do this conversion, but
// I can't think of a better place to do this so...
// Ofc can just do it manually but yea...not very viable.
const CUSTOMERNAME_TO_QBNAME = {
  "Cristo Rey School": "Interfresh Inc",
  C: "1 Time Customer",
  "Loaves and Fisher": "Redwood (Customer)",
};

function getQuickbooksCustomerName(name: string) {
  if (Object.hasOwn(CUSTOMERNAME_TO_QBNAME, name)) {
    return CUSTOMERNAME_TO_QBNAME[name];
  }
  return name;
}

export default function CustomerSaleList({
  reports,
  reportQuery,
  onSelectSale,
}: CustomerSaleListProps) {
  const navigate = useNavigate();
  const [pinnedSale, setPinnedSale] = useState([]);

  const total = useMemo(() => {
    let cash = 0;
    let check = 0;
    let receivable = 0;
    for (const report of pinnedSale) {
      if (report.paymentStatus === PaymentStatus.CASH) {
        cash += parseFloat(report.sale);
      } else if (report.paymentStatus === PaymentStatus.CHECK) {
        check += parseFloat(report.sale);
      } else if (report.paymentStatus === PaymentStatus.RECEIVABLE) {
        receivable += parseFloat(report.sale);
      }
    }

    const unpinnedSales = reports.filter((report) => {
      return !pinnedSale.find((sale) => sale.orderCode === report.orderCode);
    });
    for (const report of unpinnedSales) {
      if (report.paymentStatus === PaymentStatus.CASH) {
        cash += parseFloat(report.sale);
      } else if (report.paymentStatus === PaymentStatus.CHECK) {
        check += parseFloat(report.sale);
      } else if (report.paymentStatus === PaymentStatus.RECEIVABLE) {
        receivable += parseFloat(report.sale);
      }
    }
    return {
      cash: niceVisualDecimal(cash),
      check: niceVisualDecimal(check),
      receivable: niceVisualDecimal(receivable),
    };
  }, [reports, pinnedSale]);

  const queryClient = useQueryClient();
  const paymentMethodMut = useMutation<any, any, any>({
    mutationFn: (param: PaymentMethodMutationParam) => {
      return api.put(`/customer-payment/status/${param.code}`, {
        status: param.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const keys = query.queryKey as Array<string>;
          return keys[0] === "reports" && keys[1]?.startsWith("reports=");
        },
      });
    },
  });

  const onDownloadExcelReport = () => {
    const transformReport = (report) => ({
      order_date: convertTime(new Date(report.invoiceDate)),
      payment_date: convertTime(new Date(report.invoiceDate)),
      customer: report.customerName,
      code: `${report.manualCode ? report.manualCode : report.orderCode}`,
      sale: parseFloat(report.sale),
      test: report.isTest ? "S" : "L",
      payment_status:
        report.paymentStatus === "RECEIVABLE" ? "AR" : report.paymentStatus,
    });

    const reportData = pinnedSale.map(transformReport).concat(
      reports
        .filter((report) => {
          return !pinnedSale.find(
            (sale) => sale.orderCode === report.orderCode
          );
        })
        .map(transformReport)
    );

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

  const onExportQBO = () => {
    /**
     * Structure:
     * - Each line is a product. Since we input into QBO only the total, each line is an invoice.
     * - Columns:
     *    - InvoiceNo: invoice number.
     *    - Customer: customer name.
     *    - InvoiceDate: the date of the invoice. This is report.invoiceDate
     *    - DueDate: NOTE: Usually, this depends on the customer, but the general consensus is 3-4 weeks.
     *    - ItemAmount: The invoice total.
     *    - ItemName: To match with existing orders. Usually just "Produce".
     * Not required:
     *    - Terms: Basically set due date in a human way. Usually just "Net 30" to match the due date above.
     *    - Memo: Comment on invoice. Empty column.
     */

    const transformReport = (invoice) => {
      // 3 lines of code to add 1 day to a date. Incredible.
      const invoiceDate = new Date(invoice.invoiceDate);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30); // Default to 1 month, although this varies between customers.

      // This goes to invoice memo for now to remind that certain invoices
      // after importing will require creating payments.
      const qbPaymentReminder =
        invoice.paymentStatus === "CASH"
          ? "Paid by Cash"
          : invoice.paymentStatus === "CHECK"
          ? "Paid by Check"
          : "";

      return {
        invoice_no: `${
          invoice.manualCode ? invoice.manualCode : invoice.orderCode
        }`,
        customer: getQuickbooksCustomerName(invoice.customerName),
        invoice_date: convertTime(invoiceDate, "$1/$2/$3"),
        due_date: convertTime(dueDate, "$1/$2/$3"),
        item_amount: parseFloat(invoice.sale).toFixed(2),
        item_name: "Produce",
        terms: "Net 30", // Correspond to 30-day due date. Optional.
        memo: qbPaymentReminder,
      };
    };

    const exportData = pinnedSale.map(transformReport).concat(
      reports
        .filter((report) => {
          return !pinnedSale.find(
            (sale) => sale.orderCode === report.orderCode
          );
        })
        .map(transformReport)
    );

    const saleFile = {
      data: exportData,
      filename: `${convertTime(new Date()).split("-").join("")}_qbo`,
      delimiter: ",",
      headers: [
        "InvoiceNo",
        "Customer",
        "InvoiceDate",
        "DueDate",
        "ItemAmount",
        "Item (Product/Service)",
        "Terms",
        "Memo",
      ],
    };

    csvDownload(saleFile);
  };

  const onPinOrder = (sale) => {
    setPinnedSale(pinnedSale.concat([sale]));
  };
  const onUnpinOrder = (sale) => {
    setPinnedSale(pinnedSale.filter((s) => s.orderCode !== sale.orderCode));
  };

  const onUpdatePayment = (status: string, code: string) => {
    paymentMethodMut.mutate({
      code: code,
      status: status,
    });
  };

  if (
    reportQuery.status === "pending" ||
    reportQuery.fetchStatus === "fetching"
  ) {
    return <Spinner></Spinner>;
  }

  if (
    reportQuery.fetchStatus === "paused" ||
    (reportQuery.status === "error" && reportQuery.fetchStatus === "idle")
  ) {
    if (reportQuery.fetchStatus === "paused") {
      return (
        <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
          <Alert type="error" message="Network Error" />
        </div>
      );
    }

    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <AlertFromQueryError queryError={reportQuery.error} />
      </div>
    );
  }

  if (paymentMethodMut.status === "error") {
    // TODO: Convert this to AlertFromQueryError later.
    let error = JSON.parse(
      JSON.stringify(
        paymentMethodMut.error.response
          ? paymentMethodMut.error.response.data.error
          : paymentMethodMut.error
      )
    );
    if (error.status === 401) {
      // This is just cursed.
      handleTokenExpire(
        navigate,
        (err) => {
          error = err;
        },
        (msg) => ({ ...error, message: msg })
      );
    } else {
      setTimeout(() => {
        paymentMethodMut.reset();
        queryClient.invalidateQueries({
          predicate: (query) => {
            const keys = query.queryKey as Array<string>;
            return keys[0] === "reports" && keys[1]?.startsWith("reports=");
          },
        });
      }, 2000);
    }

    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <Alert message={error.message} type="error"></Alert>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="mx-auto mt-4 w-11/12 md:w-10/12 lg:w-6/12">
        <Alert message="Such empty, much hollow..." type="empty"></Alert>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col items-center justify-between gap-3 xl:flex-row">
        <div className="flex gap-2">
          <div className="rounded-btn flex items-center bg-sky-100 p-2 text-sm font-semibold text-sky-700 dark:bg-info">
            ${total.check} in check
          </div>
          <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-primary">
            ${total.cash} in cash
          </div>
          <div className="rounded-btn flex items-center bg-warning p-2 text-sm font-semibold text-warning-content">
            ${total.receivable} in A/R
          </div>
          {reportQuery?.data.summary.boxCount > 0 && (
            <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold">
              {reportQuery.data.summary.boxCount} boxes
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button className="btn btn-accent" onClick={onExportQBO}>
            <span className="mr-2">Export to QuickBooks</span>
            <BiExport className="h-6 w-6"></BiExport>
          </button>

          {/* FIXME: Consider deleting this button after consulting the workflow, so maybe only export QBO is needed. */}
          <button className="btn btn-accent" onClick={onDownloadExcelReport}>
            <span className="mr-2">Download report</span>
            <BiDownload className="h-6 w-6"></BiDownload>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-2">
        {/* TODO: Perharps extract this part to some component? It's duplicating code right now. */}
        {pinnedSale.map((report) => (
          <div
            key={report.orderCode}
            className={`rounded-box col-span-12 border-2 p-3 shadow-md hover:cursor-pointer sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2
          ${
            report.paymentStatus === PaymentStatus.CASH
              ? "border-primary bg-green-100 text-primary dark:border-primary dark:bg-transparent hover:dark:bg-emerald-900 hover:dark:bg-opacity-10"
              : report.paymentStatus === PaymentStatus.CHECK
              ? "border-sky-700 bg-sky-100 text-sky-700 dark:bg-transparent hover:dark:bg-sky-900 hover:dark:bg-opacity-10"
              : "border-yellow-700 bg-yellow-100 text-yellow-700 dark:border-yellow-700 dark:bg-transparent hover:dark:bg-yellow-900 hover:dark:bg-opacity-10"
          }`}
            onClick={() => {
              onSelectSale(report);
            }}
          >
            <div className="flex justify-between">
              <span>
                #{report.manualCode ? report.manualCode : report.orderCode}
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onUnpinOrder(report);
                }}
              >
                <BiPin className="h-6 w-6" />
              </span>
            </div>
            <div className="font-semibold">{report.customerName}</div>
            <div className="text-sm">
              {convertTimeToText(new Date(report.invoiceDate))}
            </div>
            <div className="">${niceVisualDecimal(report.sale)}</div>
            <div className="mt-3 grid grid-cols-12 gap-2">
              {/* TODO: The buttons are disabled because there is a bug
                where if the user change the payment, the pinned order won't update. Will figure it out later.
              */}
              {report.paymentStatus !== PaymentStatus.CHECK && (
                <button
                  className="btn btn-sm col-span-6 w-full border-sky-700 bg-sky-100 text-sky-700 hover:border-sky-700 hover:bg-sky-700 hover:text-white dark:bg-transparent"
                  disabled
                >
                  Check
                </button>
              )}
              {report.paymentStatus !== PaymentStatus.CASH && (
                <button
                  type="button"
                  className="btn btn-sm col-span-6 w-full border-emerald-700 bg-green-100 text-emerald-700 hover:border-emerald-700 hover:bg-emerald-700 hover:text-white dark:bg-transparent"
                  disabled
                >
                  Cash
                </button>
              )}
              {report.paymentStatus !== PaymentStatus.RECEIVABLE && (
                <button
                  type="button"
                  className="btn btn-sm col-span-6 w-full border-yellow-700 bg-yellow-100 text-yellow-700 hover:border-yellow-700 hover:bg-yellow-700 hover:text-white dark:bg-transparent"
                  disabled
                >
                  AR
                </button>
              )}
            </div>
          </div>
        ))}
        {reports
          .filter((report) => {
            return !pinnedSale.find(
              (sale) => sale.orderCode === report.orderCode
            );
          })
          .map((report) => (
            <div
              key={report.orderCode}
              className={`rounded-box col-span-12 border-2 p-3 shadow-md hover:cursor-pointer sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2
            ${
              report.paymentStatus === PaymentStatus.CASH
                ? "border-primary bg-green-100 text-primary dark:border-primary dark:bg-transparent hover:dark:bg-emerald-900 hover:dark:bg-opacity-10"
                : report.paymentStatus === PaymentStatus.CHECK
                ? "border-sky-700 bg-sky-100 text-sky-700 dark:bg-transparent hover:dark:bg-sky-900 hover:dark:bg-opacity-10"
                : "border-yellow-700 bg-yellow-100 text-yellow-700 dark:border-yellow-700 dark:bg-transparent hover:dark:bg-yellow-900 hover:dark:bg-opacity-10"
            }`}
              onClick={() => {
                onSelectSale(report);
              }}
            >
              <div className="flex justify-between">
                <span>
                  #{report.manualCode ? report.manualCode : report.orderCode}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinOrder(report);
                  }}
                >
                  <BiPin className="h-6 w-6 rotate-45" />
                </span>
              </div>
              <div className="font-semibold">{report.customerName}</div>
              <div className="text-sm">
                {convertTimeToText(new Date(report.invoiceDate))}
              </div>
              <div className="">${niceVisualDecimal(report.sale)}</div>
              <div className="mt-3 grid grid-cols-12 gap-2">
                {report.paymentStatus !== PaymentStatus.CHECK && (
                  <button
                    className="btn btn-sm col-span-6 w-full border-sky-700 bg-sky-100 text-sky-700 hover:border-sky-700 hover:bg-sky-700 hover:text-white dark:bg-transparent"
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
                    className="btn btn-sm col-span-6 w-full border-emerald-700 bg-green-100 text-emerald-700 hover:border-emerald-700 hover:bg-emerald-700 hover:text-white dark:bg-transparent"
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
                    className="btn btn-sm col-span-6 w-full border-yellow-700 bg-yellow-100 text-yellow-700 hover:border-yellow-700 hover:bg-yellow-700 hover:text-white dark:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePayment(
                        PaymentStatus.RECEIVABLE,
                        report.orderCode
                      );
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
