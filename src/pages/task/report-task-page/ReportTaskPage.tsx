import { HiOutlineTruck } from "react-icons/hi";
import { BiCube, BiError, BiBot } from "react-icons/bi";
import { useEffect, useState } from "react";
import api from "../../../stores/api";
import { useAuthStore } from "../../../stores/auth.store";
import Spinner from "../../../components/Spinner";

export default function ReportTaskPage() {
  const [dataState, setDataState] = useState({
    report: [],
    error: "",
    empty: "",
    loading: true,
  });
  const { nickname, role } = useAuthStore((state) => ({nickname: state.nickname, role: state.role}));

  useEffect(() => {
    api.get(`/customer-orders/tasks/report/${nickname}`)
    .then(res => {
      const reportFormat = [
        {
          label: "Today", 
          employeePicking: res.data.employeePickingDaily, 
          totalPicking: res.data.pickingDaily,
          employeeShipping: res.data.employeeShippingDaily,
          totalShipping: res.data.shippingDaily,
        },
        {
          label: "This week", 
          employeePicking: res.data.employeePickingWeekly, 
          totalPicking: res.data.pickingWeekly,
          employeeShipping: res.data.employeeShippingWeekly,
          totalShipping: res.data.shippingWeekly,
        },
        {
          label: "This month", 
          employeePicking: res.data.employeePickingMonthly, 
          totalPicking: res.data.pickingMonthly,
          employeeShipping: res.data.employeeShippingMonthly,
          totalShipping: res.data.shippingMonthly,
        },
      ];
      setDataState(prev => ({...prev, report: reportFormat, loading: false, empty: "", error: ""}));
    })
    .catch(e => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setDataState(prev => (
        {...prev, error: error.message, loading: false}
      ));
    });
  }, []);

  return (
  <>
  <section className="min-h-screen">
    <div className="flex justify-center">
      <div className="w-11/12 sm:w-8/12 md:w-7/12 lg:w-6/12">
        {dataState.loading ? (
        <>
          <div className="flex justify-center my-8">
            <Spinner></Spinner>
          </div>          
        </>) : (
        <>
          {dataState.error ? (
          <>
            <div className="alert alert-error text-red-700 flex justify-center my-8">
              <BiError className="flex-shrink-0 w-6 h-6"></BiError>
              <span>{dataState.error}</span>
            </div>          
          </>) : (
          <>
            {dataState.empty ? (
            <>
              <div className="alert bg-gray-300 text-black flex justify-center my-8">
                <BiBot className="flex-shrink-0 w-6 h-6"></BiBot>
                <span>{dataState.empty}</span>
              </div>            
            </>) : (
            <>
              {dataState.report.map((stat) => (
              <div key={stat.label}>
                <h1 className="text-center font-bold text-xl my-4">{stat.label}</h1>
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="md:w-[49%] w-full mb-4 bg-black flex items-center text-white rounded-box p-5 shadow-md">
                    <span className="p-2 rounded-full bg-gray-700 mr-4">
                      <BiCube className="w-8 h-8"></BiCube>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-2xl">{stat.employeePicking}/{stat.totalPicking}</span>
                      <span className="text-sm font-medium">Order picked</span>
                    </div>
                  </div>

                  <div className="md:w-[49%] w-full mb-4 bg-emerald-600 flex items-center text-white rounded-box p-5 shadow-md">
                    <span className="p-2 rounded-full bg-emerald-700 mr-4">
                      <HiOutlineTruck className="w-8 h-8"></HiOutlineTruck>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-2xl">{stat.employeeShipping}/{stat.totalShipping}</span>
                      <span className="text-sm font-medium">Order shipped</span>
                    </div>
                  </div>          
                </div>                
              </div>
              ))}
            </>
            )}
          </>
          )}
        </>)}
      </div>
    </div>

  </section>
  </>
  );
}