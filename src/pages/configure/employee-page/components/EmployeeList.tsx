import { useEffect, useState } from "react";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { BiEdit } from "react-icons/bi";
import EmployeeForm from "./EmployeeForm";

export default function EmployeeList() {
  const [dataState, setDataState] = useState({
    employees: [],
    errorMesage: "",
    loading: true,
  });

  const [modalData, setModalData] = useState({
    id: -1,
    nickname: "",
    active: true,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    api.get(`/accounts/employees/all`)
    .then(res => {
      setDataState(prev => ({...prev, employees: res.data, errorMessage: "", loading: false}));
    })
    .catch(e => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setDataState(prev => ({...prev, errorMessage: error.message, loading: false}));
    });
  }, [reload]);

  const onOpenForm = (data) => {
    setModalData(prev => ({...prev, id: data.id, nickname: data.nickname, active: data.active}));
    setIsOpen(true);
  }

  const onCloseForm = () => {
    setIsOpen(false);
  }

  const onReload = () => {
    setReload(!reload);
  }

  if (dataState.loading) {
    return (
      <Spinner></Spinner>
    );
  }

  if (dataState.errorMesage) {
    return (
      <div className="flex justify-center">
        <Alert type="error" message={dataState.errorMesage}></Alert>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 px-4">
      {dataState.employees.map((employee) => (
        <div key={employee.nickname} className="col-span-12 sm:col-span-6 xl:col-span-4 custom-card flex justify-between items-center">
          <div className="flex flex-col">
            <span className="font-medium">{employee.nickname}</span>
            <span className="text-sm text-neutral">{employee.active ? "Available" : "Unavailable"}</span>
          </div>
          <button className="btn btn-accent btn-circle" onClick={() => onOpenForm(employee)}>
            <span><BiEdit className="h-6 w-6"></BiEdit></span>
          </button>
        </div>
      ))}
      <EmployeeForm isOpen={isOpen} onClose={onCloseForm} employee={modalData} onReload={onReload}></EmployeeForm>
    </div>
  );
}