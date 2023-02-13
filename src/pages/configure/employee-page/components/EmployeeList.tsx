import { useEffect, useState } from "react";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { BiEdit } from "react-icons/bi";
import EmployeeForm from "./EmployeeForm";

export default function EmployeeList() {
  const [fetchData, setFetchData] = useState({
    employees: [],
    error: "",
    loading: true,
  });
  const [modal, setModal] = useState({
    employee: {
      id: -1,
      nickname: "",
      active: true,
    },
    isOpen: false,
  });
  const [reload, setReload] = useState(false);

  useEffect(() => {
    api
      .get(`/accounts/employees/all`)
      .then((res) => {
        setFetchData((prev) => ({
          ...prev,
          employees: res.data,
          error: "",
          loading: false,
        }));
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFetchData((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      });
  }, [reload]);

  const onOpenForm = (data) => {
    setModal((prev) => ({
      ...prev,
      employee: {
        ...prev.employee,
        id: data.id,
        nickname: data.nickname,
        active: data.active,
      },
      isOpen: true,
    }));
  };

  const onCloseForm = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const onReload = () => {
    setReload(!reload);
  };

  if (fetchData.loading) {
    return <Spinner></Spinner>;
  }

  if (fetchData.error) {
    return (
      <div className="mx-auto w-11/12 sm:w-8/12 xl:w-6/12">
        <Alert type="error" message={fetchData.error}></Alert>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-4 px-4">
        {fetchData.employees.map((employee) => (
          <div
            key={employee.nickname}
            className="custom-card col-span-12 flex items-center sm:col-span-6 xl:col-span-4"
          >
            <button
              className="btn-accent btn-circle btn mr-4"
              onClick={() => onOpenForm(employee)}
            >
              <span>
                <BiEdit className="h-6 w-6"></BiEdit>
              </span>
            </button>
            <div className="flex flex-col">
              <span className="font-medium">{employee.nickname}</span>
              <span className="text-sm text-neutral">
                {employee.active ? "Available" : "Not available"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <EmployeeForm
        isOpen={modal.isOpen}
        onClose={onCloseForm}
        employee={modal.employee}
        onReload={onReload}
      ></EmployeeForm>
    </>
  );
}
