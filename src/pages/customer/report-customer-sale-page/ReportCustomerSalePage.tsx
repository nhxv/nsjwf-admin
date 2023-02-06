import csvDownload from "json-to-csv-export";
import { useEffect, useState } from "react";
import { BiDownload } from "react-icons/bi";
import useFirstRender from "../../../commons/hooks/first-render.hook";
import { convertTime } from "../../../commons/time.util";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";
import CustomerSaleList from "./components/CustomerSaleList";

export default function ReportCustomerSalePage() {
  const isFirstRender = useFirstRender();
  const [listState, setListState] = useState({
    listError: "",
    listEmpty: "",
    listLoading: true,
  });
  const [data, setData] = useState({
    reports: [],
    display: [],
  })

  useEffect(() => {
    getReportData();
    // re-render after 1 min
    const reRender = setInterval(() => {
      getReportData();
    }, 60000);

    return () => {
      clearInterval(reRender);
    }
  }, []);

  useEffect(() => {
    if (!isFirstRender) {
      setListState(prev => (
        {...prev, listError: "", listEmpty: "", listLoading: false}
      ));
    }
  }, [data]);

  const getReportData = () => {
    api.get(`/customer-orders/sold/report`)
    .then((res) => {
      if (res.data.length === 0) {
        setListState(prev => ({
          ...prev, 
          listEmpty: "Such hollow, much empty...", 
          listLoading: false
        }));
      } else {
        setData(prev => ({...prev, reports: res.data, display: res.data.filter(report => report.sale > 0)}));
      }
    })
    .catch((e) => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setListState(prev => (
        {...prev, listError: error.message, listLoading: false}
      ));
    });
  }

  const onDownloadReport = () => {
    const reportData = data.reports.filter(report => report.is_test).map(report => ({
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
      headers: ["Order Code","Refund Order Code", "Customer", "Date", "Sale", "Refund"],
    }
    csvDownload(dataToConvert);
  }

  return (
    <section className="min-h-screen">
      <div className="flex flex-col items-center">
        <div className={`my-6`}>
          {(!listState.listEmpty && !listState.listError && !listState.listLoading) ? (            
          <div className="text-end">
            <button type="button" className="btn btn-accent" onClick={onDownloadReport}>
              <span className="mr-2">Download report</span>
              <BiDownload className="w-6 h-6"></BiDownload>
            </button>
          </div>
          ): null}
        </div>

        {listState.listLoading ? (
        <Spinner></Spinner>
        ) : (
        <div className="w-11/12 sm:w-8/12 xl:w-6/12">
          {listState.listError ? (
          <Alert message={listState.listError} type="error"></Alert>
          ) : (
          <>
            {listState.listEmpty ? (
            <Alert message={listState.listEmpty} type="empty"></Alert>
            ) : (
            <CustomerSaleList reports={data.display} />
            )}
          </>
          )}
        </div>)}    
      </div>
    </section>
  )
}