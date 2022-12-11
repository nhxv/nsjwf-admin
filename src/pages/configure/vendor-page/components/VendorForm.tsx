import { prepareDataForValidation, useFormik } from "formik";
import { useEffect, useState } from "react";
import { BiCheckDouble, BiError } from "react-icons/bi";
import { VendorResponse } from "../../../../models/vendor-response.model";
import api from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import TextInput from "../../../../components/TextInput";
import { useVendorConfigStore } from "../../../../stores/vendor-config.store";
import { FormType } from "../../../../commons/form-type.enum";

export default function VendorForm() {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
  });
  const { vendor, formType } = useVendorConfigStore((state) => {
    return state;
  });
  const clearVendorConfig = useVendorConfigStore((state) => state.clearVendorConfig);

  const vendorForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: (formType === FormType.EDIT ? vendor.name : ""),
      address: (formType === FormType.EDIT ? vendor.address : ""),
      phone: (formType === FormType.EDIT ? vendor.phone : ""),
      email: (formType === FormType.EDIT ? vendor.email : ""),
      presentative: (formType === FormType.EDIT ? vendor.presentative : ""),
      discontinued: (formType === FormType.EDIT ? vendor.discontinued : false),
    },
    onSubmit: async (data) => {
      setFormState(prev => ({
        ...prev, 
        error: "", 
        success: "", 
        loading: true
      }));
      if (formType === FormType.EDIT) {
        // edit mode
        try {
          const res = await api.put<VendorResponse>(`/vendors/${vendor.id}`, data);
          setFormState(prev => ({
            ...prev, 
            success: "Updated successfully.", 
            error: "", 
            loading: false,
          }));
          setTimeout(() => {
            setFormState(prev => ({...prev, success: ""}));
            clearVendorConfig();
          }, 2000);
        } catch (e) {
          const error = JSON.parse(JSON.stringify(
            e.response ? e.response.data.error : e
          ));
          setFormState(prev => ({...prev, error: error.message, success: "", loading: false}));
        }
      } else if (formType === FormType.CREATE) {
        // add mode
        try {
          const res = await api.post<VendorResponse>(`/vendors`, data);
          setFormState(prev => ({
            ...prev, 
            success: "Added successfully.", 
            error: "", 
            loading: false
          }));
          setTimeout(() => {
            setFormState(prev => ({...prev, success: ""}));
          }, 2000);
          vendorForm.resetForm();
        } catch (e) {
          const error = JSON.parse(JSON.stringify(
            e.response ? e.response.data.error : e
          ));
          setFormState(prev => ({...prev, error: error.message, success: "", loading: false}));
        }
      }
    }
  });

  useEffect(() => {
    vendorForm.values.name = vendor.name;
    vendorForm.values.address = vendor.address,
    vendorForm.values.phone = vendor.phone,
    vendorForm.values.email = vendor.email,
    vendorForm.values.presentative = vendor.presentative;
    vendorForm.values.discontinued = vendor.discontinued;
  }, [vendor]);

  const onClear = () => {
    clearVendorConfig();
    setFormState(prev => ({...prev, success: "", error: "", loading: false}));
    vendorForm.resetForm();
  }

  return (
  <>
    <form onSubmit={vendorForm.handleSubmit}>
      <div className="mb-5">
        <label htmlFor="name" className="font-medium inline-block mb-2">
          <span>Name</span>
          <span className="text-red-500">*</span>
        </label>
        <TextInput id="name" type="text" name="name" placeholder={`Name`} 
        value={vendorForm.values.name} 
        onChange={vendorForm.handleChange}
        onBlur={vendorForm.handleBlur}
        ></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="address" className="font-medium inline-block mb-2">Address</label>
        <TextInput id="address" type="text" name="address" placeholder={`Address`} 
        value={vendorForm.values.address} 
        onChange={vendorForm.handleChange}
        onBlur={vendorForm.handleBlur}
        ></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="phone" className="font-medium inline-block mb-2">Phone</label>
        <TextInput id="phone" type="text" name="phone" placeholder={`Phone`} 
        value={vendorForm.values.phone} 
        onChange={vendorForm.handleChange}
        onBlur={vendorForm.handleBlur}
        ></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="email" className="font-medium inline-block mb-2">Email</label>
        <TextInput id="email" type="email" name="email" placeholder={`Email`} 
        value={vendorForm.values.email} 
        onChange={vendorForm.handleChange}
        onBlur={vendorForm.handleBlur}
        ></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="presentative" className="font-medium inline-block mb-2">Presentative</label>
        <TextInput id="presentative" type="presentative" name="presentative" placeholder={`Presentative`} 
        value={vendorForm.values.presentative} 
        onChange={vendorForm.handleChange}
        onBlur={vendorForm.handleBlur}
        ></TextInput>
      </div>
      
      <div className="mb-5 flex items-center">
        <input id="discontinued" name="discontinued" type="checkbox" 
        onChange={() => vendorForm.setFieldValue("discontinued", !vendorForm.values.discontinued)} 
        checked={!vendorForm.values.discontinued} 
        className="checkbox checkbox-primary border-gray-400 rounded-md"/>
        <label htmlFor="discontinued" className="ml-2">In use</label>
      </div>
      <button type="submit" className="mt-1 btn btn-primary w-full text-white">
        <span>{formType} vendor</span>
      </button>
      <button type="button" className="mt-3 btn btn-accent w-full" onClick={onClear}>
        <span>Clear change(s)</span>
      </button>
      <div>
        {formState.loading ? (
        <>
          <div className="mt-5 flex justify-center">
            <Spinner></Spinner>
          </div>
        </>
        ) : <></>}
        {formState.success ? (
        <>
          <div className="mt-5 alert alert-success text-green-700 flex justify-center">
            <div>
              <BiCheckDouble className="flex-shrink-0 w-6 h-6"></BiCheckDouble>
              <span>{formState.success}</span>
            </div>
          </div>
        </>
        ) : (<></>)}
        {formState.error ? (
        <>
          <div className="mt-5 alert alert-error text-red-700 flex justify-center">
            <div>
              <BiError className="flex-shrink-0 w-6 h-6"></BiError>
              <span>{formState.error}</span>
            </div>
          </div>
        </>
        ) : (<></>)}
      </div>
    </form>
  </>
  )
}