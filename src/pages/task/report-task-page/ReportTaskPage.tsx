import { useEffect, useState } from "react";
import { BiCube } from "react-icons/bi";
import { HiOutlineTruck } from "react-icons/hi";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";
import { useAuthStore } from "../../../stores/auth.store";
import { useNavigate } from "react-router-dom";
import { handleTokenExpire } from "../../../commons/utils/token.util";

export default function ReportTaskPage() {
  const navigate = useNavigate();
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

        if (error.status === 401) {
          handleTokenExpire(navigate, setDataState);
        }
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
                            <h1 className="my-4 text-center text-xl font-bold">
                              {stat.label}
                            </h1>
                            <div className="flex flex-col justify-between md:flex-row">
                              <div className="rounded-box mb-4 flex w-full items-center bg-yellow-500 p-5 text-black shadow-md md:w-[49%]">
                                <span className="mr-4 rounded-full bg-yellow-600 p-2">
                                  <BiCube className="h-8 w-8"></BiCube>
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-2xl font-bold">
                                    {stat.employeePicking}/{stat.totalPicking}
                                  </span>
                                  <span className="text-sm font-medium">
                                    Order picked
                                  </span>
                                </div>
                              </div>

                              <div className="rounded-box mb-4 flex w-full items-center bg-primary p-5 text-white shadow-md md:w-[49%]">
                                <span className="mr-4 rounded-full bg-emerald-800 p-2">
                                  <HiOutlineTruck className="h-8 w-8"></HiOutlineTruck>
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-2xl font-bold">
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
