import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { BiCheckDouble, BiError } from "react-icons/bi";
import { VehicleResponse } from "../../../../models/vehicle-response.model";
import api from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import TextInput from "../../../../components/TextInput";
import { useVehicleConfigStore } from "../../../../stores/vehicle-config.store";
import { FormType } from "../../../../commons/form-type.enum";

export default function VehicleForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { vehicle, formType } = useVehicleConfigStore((state) => {
    return state;
  });
  const clearVehicleConfig = useVehicleConfigStore((state) => state.clearVehicleConfig);

  const vehicleForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      licensePlate: (formType === FormType.EDIT ? vehicle.licensePlate : ""),
      available: (formType === FormType.EDIT ? vehicle.available : true),
      discontinued: (formType === FormType.EDIT ? vehicle.discontinued : false),
      nickname: (formType === FormType.EDIT ? vehicle.nickname : ""),
      volume: (formType === FormType.EDIT ? vehicle.volume : 0),
    },
    onSubmit: async (data) => {
      setLoading(true);

      if (formType === FormType.EDIT) {
        // edit mode
        try {
          const res = await api.put<VehicleResponse>(`/vehicles/${vehicle.id}`, data);
          setLoading(false);
          setSuccessMessage("Updated successfully.")
          setTimeout(() => {
            setSuccessMessage("");
            clearVehicleConfig();
          }, 1000);
          vehicleForm.resetForm();
        } catch (e) {
          setLoading(false);
          const error = JSON.parse(JSON.stringify(e));
          setErrorMessage(error.message);
          setTimeout(() => {
            setErrorMessage("");
          }, 2000);
          vehicleForm.resetForm();
        }
      } else if (formType === FormType.ADD) {
        // add mode
        try {
          const res = await api.post<VehicleResponse>(`/vehicles`, data);
          setLoading(false);
          setSuccessMessage("Added successfully.")
          setTimeout(() => {
            setSuccessMessage("");
          }, 2000);
          vehicleForm.resetForm();
        } catch (e) {
          setLoading(false);
          const error = JSON.parse(JSON.stringify(e));
          setErrorMessage(error.message);
          setTimeout(() => {
            setErrorMessage("");
          }, 2000);
          vehicleForm.resetForm();
        }
      }
    }
  });

  useEffect(() => {
    vehicleForm.values.licensePlate = vehicle.licensePlate;
    vehicleForm.values.available = vehicle.available;
    vehicleForm.values.discontinued = vehicle.discontinued;
    vehicleForm.values.nickname = vehicle.nickname;
    vehicleForm.values.volume = vehicle.volume;
  }, [vehicle]);

  const onClear = () => {
    clearVehicleConfig();
    vehicleForm.resetForm();
  }

  return (
  <>
    <form onSubmit={vehicleForm.handleSubmit}>
      <div className="mb-5">
        <label htmlFor="license-plate" className="font-medium">License Plate</label>
        <TextInput id="license-plate" type="text" name="licensePlate" placeholder={`License Plate`} 
        value={vehicleForm.values.licensePlate} onChange={vehicleForm.handleChange}></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="nickname" className="font-medium">Nickname</label>
        <TextInput id="nickname" type="text" name="nickname" placeholder={`Nickname`} 
        value={vehicleForm.values.nickname} onChange={vehicleForm.handleChange}></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="volume" className="font-medium">Volume</label>
        <TextInput id="volume" type="number" name="volume" placeholder={`Volume`} 
        value={vehicleForm.values.volume} onChange={vehicleForm.handleChange}></TextInput>
      </div>

      <div className="mb-5 flex items-center">
        <input id="available" name="available" type="checkbox" 
        onChange={() => vehicleForm.setFieldValue("available", !vehicleForm.values.available)} 
        checked={vehicleForm.values.available} 
        className="checkbox checkbox-primary border-gray-400 rounded-md"/>
        <label htmlFor="discontinued" className="ml-2">Available</label>
      </div>
      
      <div className="mb-5 flex items-center">
        <input id="discontinued" name="discontinued" type="checkbox" 
        onChange={() => vehicleForm.setFieldValue("discontinued", !vehicleForm.values.discontinued)} 
        checked={!vehicleForm.values.discontinued} 
        className="checkbox checkbox-primary border-gray-400 rounded-md"/>
        <label htmlFor="discontinued" className="ml-2">In use</label>
      </div>

      <button type="submit" className="mt-1 btn btn-primary w-full text-white">
        <span>{formType} vehicle</span>
      </button>

      <button type="button" className="mt-3 btn btn-accent w-full" onClick={onClear}>
        <span>Clear form</span>
      </button>

      <div>
        {loading ? (
        <>
          <div className="my-5 flex justify-center">
            <Spinner></Spinner>
          </div>
        </>
        ) : <></>}
        {successMessage ? (
        <>
          <div className="my-5 alert alert-success text-green-700">
            <div>
              <BiCheckDouble className="flex-shrink-0 w-6 h-6"></BiCheckDouble>
              <span>{successMessage}</span>
            </div>
          </div>
        </>
        ) : (<></>)}
        {errorMessage ? (
        <>
          <div className="my-5 alert alert-error text-red-700">
            <div>
              <BiError className="flex-shrink-0 w-6 h-6"></BiError>
              <span>{errorMessage}</span>
            </div>
          </div>
        </>
        ) : (<></>)}
      </div>
    </form>
  </>
  )
}