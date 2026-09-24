import { BiX } from "react-icons/bi";
import Modal from "../../../../components/Modal";
import TextInput from "../../../../components/forms/TextInput";
import { Controller, useForm } from "react-hook-form";
import Checkbox from "../../../../components/forms/Checkbox";
import api, { getApiError } from "../../../../stores/api";
import { useState } from "react";
import Spinner from "../../../../components/Spinner";
import Alert from "../../../../components/Alert";

export default function EmployeeForm({ isOpen, onClose, employee, onReload }) {
  const [formState, setFormState] = useState({
    error: "",
    loading: false,
  });

  const { control, handleSubmit } = useForm({
    values: {
      username: "",
      password: "",
      nickname: employee.nickname,
      active: employee.active,
    },
  });

  const onSubmit = async (data) => {
    setFormState((prev) => ({
      ...prev,
      error: "",
      loading: true,
    }));
    try {
      const res = await api.put(`/accounts/employees/${employee.id}`, data);
      setFormState((prev) => ({ ...prev, error: "", loading: false }));
      onReload();
      onClose();
    } catch (e) {
      const error = getApiError(e);
      setFormState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
    }
  };

  const onCloseForm = () => {
    setFormState((prev) => ({ ...prev, error: "", loading: false }));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onCloseForm}>
      <div className="custom-card text-left">
        <div className="flex justify-end">
          <button type="button" className="btn btn-circle btn-accent btn-sm" onClick={onCloseForm}>
            <BiX className="h-6 w-6"></BiX>
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <label htmlFor="username" className="custom-label mb-2 inline-block">
              <span>Username</span>
            </label>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextInput id="username" type="text" placeholder={`Username`} name={field.name} value={field.value} onChange={field.onChange}></TextInput>
              )}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="custom-label mb-2 inline-block">
              <span>Password</span>
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextInput id="password" type="password" placeholder={`Password`} name={field.name} value={field.value} onChange={field.onChange}></TextInput>
              )}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="nickname" className="custom-label mb-2 inline-block">
              <span>Nickname</span>
            </label>
            <Controller
              name="nickname"
              control={control}
              render={({ field }) => (
                <TextInput id="nickname" type="text" placeholder={`Nickname`} name={field.name} value={field.value} onChange={field.onChange}></TextInput>
              )}
            />
          </div>

          <div className="mb-5 flex items-center">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Checkbox id="active" name={field.name} onChange={() => field.onChange(!field.value)} checked={field.value} label="Available"></Checkbox>
              )}
            />
          </div>
          <button type="submit" className="btn btn-primary mt-1 w-full" disabled={formState.loading}>
            Update
          </button>

          {formState.loading && (
            <div className="mt-5">
              <Spinner></Spinner>
            </div>
          )}
          {formState.error && (
            <div className="mt-5">
              <Alert message={formState.error} type="error"></Alert>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}
