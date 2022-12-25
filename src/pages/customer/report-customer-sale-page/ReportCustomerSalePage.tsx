import { useState, useEffect } from "react";
import useFirstRender from "../../../commons/hooks/first-render.hook";
import csvDownload from "json-to-csv-export";
import { convertTime } from "../../../commons/time.util";
import api from "../../../stores/api";
import { BiDownload, BiError, BiBot } from "react-icons/bi";
import Spinner from "../../../components/Spinner";
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
        {...prev, listLoading: false}
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
      }
      setData(prev => ({...prev, reports: res.data, display: res.data.filter(report => report.sale > 0)}));
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
      code: `#${report.order_code}`,
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
    <>
      <section className="min-h-screen">
        <div className="flex flex-col items-center">
          <div className={`my-6`}>
            {(!listState.listEmpty && !listState.listError && !listState.listLoading) ? (            
            <div className="text-end">
              <button type="button" className="btn btn-accent text-black" onClick={onDownloadReport}>
                <span className="mr-2">Download report</span>
                <BiDownload className="w-6 h-6"></BiDownload>
              </button>
            </div>
            ): (<></>)}
          </div>

          {listState.listLoading ? (
          <>
            <div className="flex justify-center">
              <Spinner></Spinner>
            </div>            
          </>
          ) : (
          <>
            {listState.listError ? (
            <>
            <div className="w-11/12 sm:w-8/12 md:w-6/12 alert alert-error text-red-700 flex justify-center">
              <div>
                <BiError className="flex-shrink-0 w-6 h-6"></BiError>
                <span>{listState.listError}</span>
              </div>
            </div>              
            </>
            ) : (
            <>
              {listState.listEmpty ? (
              <>
                <div className="w-11/12 sm:w-8/12 md:w-6/12 alert bg-gray-300 text-black flex justify-center">
                  <div>
                    <BiBot className="flex-shrink-0 w-6 h-6"></BiBot>
                    <span>{listState.listEmpty}</span>
                  </div>
                </div>                
              </>
              ) : (
              <>
              <div className="w-11/12 sm:w-8/12 md:w-6/12">
                <CustomerSaleList reports={data.display} />
              </div>
              </>
              )}
            </>
            )}
          </>)}    
        </div>
      </section>
    </>
  )
}