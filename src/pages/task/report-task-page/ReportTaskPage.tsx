import { useEffect, useState } from "react";
import { BiCube } from "react-icons/bi";
import { HiOutlineTruck } from "react-icons/hi";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";
import { useAuthStore } from "../../../stores/auth.store";

export default function ReportTaskPage() {
  const [dataState, setDataState] = useState({
    report: [],
    error: "",
    empty: "",
    loading: true,
  });
  const { nickname, role } = useAuthStore((state) => ({
    nickname: state.nickname,
    role: state.role,
  }));

  useEffect(() => {
    api
      .get(`/customer-orders/tasks/report/${nickname}`)
      .then((res) => {
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
        setDataState((prev) => ({
          ...prev,
          report: reportFormat,
          loading: false,
          empty: "",
          error: "",
        }));
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setDataState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      });
  }, []);

  return (
    <>
      <section className="min-h-screen">
        <div className="flex justify-center">
          <div className="w-11/12 sm:w-8/12 md:w-7/12 lg:w-6/12">
            {dataState.loading ? (
              <div className="my-8">
                <Spinner></Spinner>
              </div>
            ) : (
              <>
                {dataState.error ? (
                  <div className="my-8">
                    <Alert message={dataState.error} type="error"></Alert>
                  </div>
                ) : (
                  <>
                    {dataState.empty ? (
                      <div className="my-8">
                        <Alert message={dataState.empty} type="empty"></Alert>
                      </div>
                    ) : (
                      <>
                        {dataState.report.map((stat) => (
                          <div key={stat.label}>
                            <h1 className="text-center font-bold text-xl my-4">
                              {stat.label}
                            </h1>
                            <div className="flex flex-col md:flex-row justify-between">
                              <div className="md:w-[49%] w-full mb-4 bg-yellow-500 flex items-center text-black rounded-box p-5 shadow-md">
                                <span className="p-2 rounded-full bg-yellow-600 mr-4">
                                  <BiCube className="w-8 h-8"></BiCube>
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-bold text-2xl">
                                    {stat.employeePicking}/{stat.totalPicking}
                                  </span>
                                  <span className="text-sm font-medium">
                                    Order picked
                                  </span>
                                </div>
                              </div>

                              <div className="md:w-[49%] w-full mb-4 bg-primary flex items-center text-white rounded-box p-5 shadow-md">
                                <span className="p-2 rounded-full bg-emerald-800 mr-4">
                                  <HiOutlineTruck className="w-8 h-8"></HiOutlineTruck>
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-bold text-2xl">
                                    {stat.employeeShipping}/{stat.totalShipping}
                                  </span>
                                  <span className="text-sm font-medium">
                                    Order shipped
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
