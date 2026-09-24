import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { BiCheckDouble, BiError } from "react-icons/bi";
import { VehicleResponse } from "../../../../models/vehicle-response.model";
import api, { getApiError } from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import TextInput from "../../../../components/forms/TextInput";
import { useVehicleConfigStore } from "../../../../stores/vehicle-config.store";
import { FormType } from "../../../../commons/form-type.enum";
import Checkbox from "../../../../components/forms/Checkbox";
import NumberInput from "../../../../components/forms/NumberInput";
import Alert from "../../../../components/Alert";

export default function VehicleForm() {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
  });
  const { vehicle, formType } = useVehicleConfigStore((state) => {
    return state;
  });
  const clearVehicleConfig = useVehicleConfigStore((state) => state.clearVehicleConfig);

  const { control, handleSubmit, reset } = useForm({
    values: {
      licensePlate: formType === FormType.EDIT ? vehicle.licensePlate : "",
      available: formType === FormType.EDIT ? vehicle.available : true,
      discontinued: formType === FormType.EDIT ? vehicle.discontinued : false,
      nickname: formType === FormType.EDIT ? vehicle.nickname : "",
      volume: formType === FormType.EDIT ? vehicle.volume : 0,
    },
  });

  const onSubmit = async (data) => {
    setFormState((prev) => ({
      ...prev,
      error: "",
      success: "",
      loading: true,
    }));
    if (formType === FormType.EDIT) {
      // edit mode
      try {
        const res = await api.put<VehicleResponse>(`/vehicles/${vehicle.id}`, data);
        setFormState((prev) => ({
          ...prev,
          success: "Updated successfully.",
          error: "",
          loading: false,
        }));
        setTimeout(() => {
          setFormState((prev) => ({ ...prev, success: "" }));
          clearVehicleConfig();
        }, 2000);
      } catch (e) {
        const error = getApiError(e);
        setFormState((prev) => ({
          ...prev,
          error: error.message,
          success: "",
          loading: false,
        }));
      }
    } else if (formType === FormType.CREATE) {
      // add mode
      try {
        const res = await api.post<VehicleResponse>(`/vehicles`, data);
        setFormState((prev) => ({
          ...prev,
          success: "Added successfully.",
          error: "",
          loading: false,
        }));
        setTimeout(() => {
          setFormState((prev) => ({ ...prev, success: "" }));
        }, 2000);
        reset();
      } catch (e) {
        const error = getApiError(e);
        setFormState((prev) => ({
          ...prev,
          error: error.message,
          success: "",
          loading: false,
        }));
      }
    }
  };

  const onClear = () => {
    clearVehicleConfig();
    setFormState((prev) => ({
      ...prev,
      success: "",
      error: "",
      loading: false,
    }));
    reset();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label htmlFor="license-plate" className="custom-label mb-2 inline-block">
            <span>License Plate</span>
            <span className="text-red-500">*</span>
          </label>
          <Controller
            name="licensePlate"
            control={control}
            render={({ field }) => (
              <TextInput
                id="license-plate"
                type="text"
                name={field.name}
                placeholder={`License Plate`}
                value={field.value}
                onChange={field.onChange}></TextInput>
            )}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="nickname" className="custom-label mb-2 inline-block">
            Nickname
          </label>
          <Controller
            name="nickname"
            control={control}
            render={({ field }) => (
              <TextInput id="nickname" type="text" name={field.name} placeholder={`Nickname`} value={field.value} onChange={field.onChange}></TextInput>
            )}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="volume" className="custom-label mb-2 inline-block">
            Volume
          </label>
          <Controller
            name="volume"
            control={control}
            render={({ field }) => (
              <NumberInput id="volume" name={field.name} placeholder={`Volume`} value={field.value} onChange={field.onChange}></NumberInput>
            )}
          />
        </div>

        <div className="mb-5 flex items-center">
          <Controller
            name="available"
            control={control}
            render={({ field }) => (
              <Checkbox id="available" name={field.name} onChange={() => field.onChange(!field.value)} checked={field.value} label="Available"></Checkbox>
            )}
          />
        </div>

        <div className="mb-5 flex items-center">
          <Controller
            name="discontinued"
            control={control}
            render={({ field }) => (
              <Checkbox id="discontinued" name={field.name} onChange={() => field.onChange(!field.value)} checked={!field.value} label="In use"></Checkbox>
            )}
          />
        </div>

        <button type="submit" className="btn btn-primary mt-1 w-full" disabled={formState.loading}>
          <span>{formType} vehicle</span>
        </button>

        <button type="button" className="btn btn-accent mt-3 w-full" onClick={onClear}>
          <span>Clear change(s)</span>
        </button>

        <div>
          {formState.loading ? (
            <div className="mt-5">
              <Spinner></Spinner>
            </div>
          ) : null}
          {formState.success ? (
            <>
              <div className="mt-5">
                <Alert message={formState.success} type="success"></Alert>
              </div>
            </>
          ) : null}
          {formState.error ? (
            <div className="mt-5">
              <Alert message={formState.error} type="error"></Alert>
            </div>
          ) : null}
        </div>
      </form>
    </>
  );
}
