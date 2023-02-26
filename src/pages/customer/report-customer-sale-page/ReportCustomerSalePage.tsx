import csvDownload from "json-to-csv-export";
import { useEffect, useState } from "react";
import { BiDownload } from "react-icons/bi";
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

  useEffect(() => {
    getReportData();
    // re-render after 1 min
    const reRender = setInterval(() => {
      getReportData();
    }, 60000);

    return () => {
      clearInterval(reRender);
    };
  }, []);

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
    const reportData = fetchData.reports
      .filter((report) => report.is_test)
      .map((report) => ({
        code: `#${report.manual_code ? report.manual_code : report.order_code}`,
        refund_code: `#${report.refund_order}`,
        customer: report.customer_name,
        date: convertTime(new Date(report.date)),
        sale: report.sale,
        refund: report.refund,
      }));
    const dataToConvert = {
      data: reportData,
      filename: `${convertTime(new Date()).split("-").join("")}_report`,
      delimiter: ",",
      headers: [
        "Order Code",
        "Refund Order Code",
        "Customer",
        "Date",
        "Sale",
        "Refund",
      ],
    };
    csvDownload(dataToConvert);
  };

  return (
    <section className="min-h-screen">
      <div className="flex flex-col items-center">
        <div className={`my-6`}>
          {!fetchData.empty && !fetchData.error && !fetchData.loading ? (
            <div className="text-end">
              <button
                type="button"
                className="btn-accent btn"
                onClick={onDownloadReport}
              >
                <span className="mr-2">Download report</span>
                <BiDownload className="h-6 w-6"></BiDownload>
              </button>
            </div>
          ) : null}
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
                  <CustomerSaleList reports={fetchData.display} />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
