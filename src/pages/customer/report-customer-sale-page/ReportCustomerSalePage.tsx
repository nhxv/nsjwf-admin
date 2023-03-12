import csvDownload from "json-to-csv-export";
import { useEffect, useState } from "react";
import { BiDownload, BiSearch } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { PaymentStatus } from "../../../commons/enums/payment-status.enum";
import { convertTime } from "../../../commons/utils/time.util";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";
import CustomerSaleList from "./components/CustomerSaleList";

export default function ReportCustomerSalePage() {
  const [fetchData, setFetchData] = useState({
    reports: [],
    display: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();

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
      test: report.is_test ? "L" : "S",
      cash: 0,
      check: 0,
      receivable: 0,
    }));
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
    reportData[0]["cash"] = cash;
    reportData[0]["check"] = check;
    reportData[0]["receivable"] = receivable;
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

  const onSearch = () => {
    navigate(`/customer/search-customer-sale`);
  };

  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">Daily sale</h1>
      <div className="flex flex-col items-center">
        {!fetchData.empty && !fetchData.error && !fetchData.loading && (
          <div className="mb-6 text-end">
            <button
              type="button"
              className="btn-accent btn"
              onClick={onDownloadReport}
            >
              <span className="mr-2">Download report</span>
              <BiDownload className="h-6 w-6"></BiDownload>
            </button>
          </div>
        )}
        <div className="fixed bottom-24 right-6 z-20 md:right-8">
          <button className="btn-accent btn-circle btn" onClick={onSearch}>
            <span>
              <BiSearch className="h-6 w-6"></BiSearch>
            </span>
          </button>
        </div>

        {fetchData.loading ? (
          <Spinner></Spinner>
        ) : (
          <div className="w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
            {fetchData.error ? (
              <Alert message={fetchData.error} type="error"></Alert>
            ) : (
              <>
                {fetchData.empty ? (
                  <Alert message={fetchData.empty} type="empty"></Alert>
                ) : (
                  <CustomerSaleList
                    reports={fetchData.display}
                    reload={onReload}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
