import csvDownload from "json-to-csv-export";
import { useMemo } from "react";
import { BiDownload, BiExport } from "react-icons/bi";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";

interface CustomerSaleListProps {
  reports: Array<any>;
  reportQuery;
  onSelectSale: (sale: any) => void;
}

// Mutation doesn't accept more than 1 param so here we are.
interface PaymentMethodMutationParam {
  code: string;
  status: string;
}

export default function CustomerSaleList({
  reports,
  reportQuery,
  onSelectSale,
}: CustomerSaleListProps) {
  const navigate = useNavigate();
  const total = useMemo(() => {
    let cash = 0;
    let check = 0;
    let receivable = 0;
    for (const report of reports) {
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
  }, [reports]);

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
    const reportData = reports.map((report) => ({
      // For these 2 dates, most of the time, they'll be the same since the app only allows
      // user to view orders that are completed today. However, to respect data, we'll
      // use report.date instead of Date.now().
      // In the case of receivable, we also put the date the same (as of my knowledge).
      order_date: convertTime(new Date(report.updatedAt)),
      payment_date: convertTime(new Date(report.updatedAt)),
      customer: report.customerName,
      code: `${report.manualCode ? report.manualCode : report.orderCode}`,
      sale: parseFloat(report.sale),
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

  const onExportQBO = () => {
    /**
     * Structure:
     * - Each line is a product. Since we input into QBO only the total, each line is an invoice.
     * - Columns:
     *    - InvoiceNo: invoice number.
     *    - Customer: customer name.
     *    - InvoiceDate: the date of the invoice. This is report.updatedAt
     *    - DueDate: NOTE: Usually, this depends on the customer, but the general consensus is 3-4 weeks.
     *    - ItemAmount: The invoice total.
     *    - ItemName: To match with existing orders. Usually just "Produce".
     * Not required:
     *    - Memo: Comment on invoice. Empty column.
     */

    const exportData = reports.map((invoice) => {
      // 3 lines of code to add 1 day to a date. Incredible.
      const invoiceDate = new Date(invoice.updatedAt);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30); // Default to 1 month, although this varies between customers.

      return {
        invoice_no: `${
          invoice.manualCode ? invoice.manualCode : invoice.orderCode
        }`,
        customer: invoice.customerName,
        invoice_date: convertTime(invoiceDate, "$1/$2/$3"),
        due_date: convertTime(dueDate, "$1/$2/$3"),
        item_amount: parseFloat(invoice.sale).toFixed(2),
        item_name: "Produce",
        memo: "", // Maybe add the sale note to here? For now just placeholder.
      };
    });

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
        "Memo",
      ],
    };

    csvDownload(saleFile);
  };

  const onUpdatePayment = (status: string, code: string) => {
    paymentMethodMut.mutate({
      code: code,
      status: status,
    });
  };

  if (
    reportQuery.status === "loading" ||
    reportQuery.fetchStatus === "fetching"
  ) {
    return <Spinner></Spinner>;
  }

  if (
    reportQuery.fetchStatus === "paused" ||
    (reportQuery.status === "error" && reportQuery.fetchStatus === "idle")
  ) {
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
        </div>

        <div className="flex gap-2">
          <button className="btn btn-accent" onClick={onExportQBO}>
            <span className="mr-2">Export to Quickbooks</span>
            <BiExport className="h-6 w-6"></BiExport>
          </button>
          <button className="btn btn-accent" onClick={onDownloadExcelReport}>
            <span className="mr-2">Download report</span>
            <BiDownload className="h-6 w-6"></BiDownload>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-2">
        {reports.map((report) => (
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
            <div>
              #{report.manualCode ? report.manualCode : report.orderCode}
            </div>
            <div className="font-semibold">{report.customerName}</div>
            <div className="text-sm">
              {convertTimeToText(new Date(report.updatedAt))}
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
