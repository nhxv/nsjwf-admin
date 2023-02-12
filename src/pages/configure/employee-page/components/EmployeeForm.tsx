import { BiX } from "react-icons/bi";
import Modal from "../../../../components/Modal";
import TextInput from "../../../../components/forms/TextInput";
import { useFormik } from "formik";
import Checkbox from "../../../../components/forms/Checkbox";
import api from "../../../../stores/api";
import { useState } from "react";
import Spinner from "../../../../components/Spinner";
import Alert from "../../../../components/Alert";

export default function EmployeeForm({ isOpen, onClose, employee, onReload }) {
  const [formState, setFormState] = useState({
    error: "",
    loading: false,
  });

  const employeeForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      nickname: employee.nickname,
      active: employee.active,
    },
    onSubmit: async (data) => {
      setFormState(prev => ({
        ...prev, 
        error: "", 
        loading: true,
      }));
      try {
        const res = await api.put(`/accounts/employees/${employee.id}`, data);
        setFormState(prev => ({...prev, error: "", loading: false}));
        onReload();
        onClose();
      } catch (e) {
        const error = JSON.parse(JSON.stringify(
          e.response ? e.response.data.error : e
        ));
        setFormState(prev => ({...prev, error: error.message, loading: false}));
      }
    }
  });

  const onCloseForm = () => {
    setFormState(prev => ({...prev, error: "", loading: false}));
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onCloseForm}>
      <div className="custom-card text-left">
        <div className="flex justify-end">
          <button type="button" className="btn btn-circle btn-accent btn-sm" onClick={onCloseForm}>
            <BiX className="h-6 w-6"></BiX>
          </button>
        </div>
        <form onSubmit={employeeForm.handleSubmit}>
          <div className="mb-5">
            <label htmlFor="name" className="custom-label inline-block mb-2">
              <span>Nickname</span>
              <span className="text-red-500">*</span>
            </label>
            <TextInput id="nickname" type="text" placeholder={`Nickname`} 
            name="nickname" value={employeeForm.values.nickname}
            onChange={employeeForm.handleChange}></TextInput>
          </div>
          <div className="mb-5 flex items-center">
            <Checkbox id="active" name="active"
            onChange={() => employeeForm.setFieldValue("active", !employeeForm.values.active)} 
            checked={employeeForm.values.active}
            label="Available"></Checkbox>
          </div>
          <button type="submit" className="btn btn-primary w-full mt-1" disabled={formState.loading}>Update</button>

          {formState.loading ? (
          <div className="mt-5">
            <Spinner></Spinner>
          </div>
          ) : null}
          {formState.error ? (
          <div className="mt-5">
            <Alert message={formState.error} type="error"></Alert>
          </div>
          ) : null}
        </form>
      </div>
    </Modal>
  );
}