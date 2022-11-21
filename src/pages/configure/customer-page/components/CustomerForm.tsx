import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { BiCheckDouble, BiError } from "react-icons/bi";
import { CustomerResponse } from "../../../../models/customer-response.model";
import api from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import TextInput from "../../../../components/TextInput";
import { useCustomerConfigStore } from "../../../../stores/customer-config.store";
import { FormType } from "../../../../commons/form-type.enum";

export default function CustomerForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { customer, formType } = useCustomerConfigStore((state) => {
    return state;
  });
  const clearCustomerConfig = useCustomerConfigStore((state) => state.clearCustomerConfig);

  const customerForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: (formType === FormType.EDIT ? customer.name : ""),
      address: (formType === FormType.EDIT ? customer.address : ""),
      phone: (formType === FormType.EDIT ? customer.phone : ""),
      email: (formType === FormType.EDIT ? customer.email : ""),
      presentative: (formType === FormType.EDIT ? customer.presentative : ""),
      discontinued: (formType === FormType.EDIT ? customer.discontinued : false),
    },
    onSubmit: async (data) => {
      setLoading(true);

      if (formType === FormType.EDIT) {
        // edit mode
        try {
          const res = await api.put<CustomerResponse>(`/customers/${customer.id}`, data);
          setLoading(false);
          setSuccessMessage("Updated successfully.")
          setTimeout(() => {
            setSuccessMessage("");
            clearCustomerConfig();
          }, 1000);
          customerForm.resetForm();
        } catch (e) {
          setLoading(false);
          const error = JSON.parse(JSON.stringify(e));
          setErrorMessage(error.message);
          setTimeout(() => {
            setErrorMessage("");
          }, 2000);
          customerForm.resetForm();
        }
      } else if (formType === FormType.ADD) {
        // add mode
        try {
          const res = await api.post<CustomerResponse>(`/customers`, data);
          setLoading(false);
          setSuccessMessage("Added successfully.")
          setTimeout(() => {
            setSuccessMessage("");
          }, 2000);
          customerForm.resetForm();
        } catch (e) {
          setLoading(false);
          const error = JSON.parse(JSON.stringify(e));
          setErrorMessage(error.message);
          setTimeout(() => {
            setErrorMessage("");
          }, 2000);
          customerForm.resetForm();
        }
      }
    }
  });

  useEffect(() => {
    customerForm.values.name = customer.name;
    customerForm.values.address = customer.address,
    customerForm.values.phone = customer.phone,
    customerForm.values.email = customer.email,
    customerForm.values.presentative = customer.presentative;
    customerForm.values.discontinued = customer.discontinued;
  }, [customer]);

  const onClear = () => {
    clearCustomerConfig();
    customerForm.resetForm();
  }

  return (
  <>
    <form onSubmit={customerForm.handleSubmit}>
      <div className="mb-5">
        <label htmlFor="name" className="font-medium">Name</label>
        <TextInput id="name" type="text" name="name" placeholder={`Name`} 
        value={customerForm.values.name} onChange={customerForm.handleChange}></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="address" className="font-medium">Address</label>
        <TextInput id="address" type="text" name="address" placeholder={`Address`} 
        value={customerForm.values.address} onChange={customerForm.handleChange}></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="phone" className="font-medium">Phone</label>
        <TextInput id="phone" type="text" name="phone" placeholder={`Phone`} 
        value={customerForm.values.phone} onChange={customerForm.handleChange}></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="email" className="font-medium">Email</label>
        <TextInput id="email" type="email" name="email" placeholder={`Email`} 
        value={customerForm.values.email} onChange={customerForm.handleChange}></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="presentative" className="font-medium">Presentative</label>
        <TextInput id="presentative" type="presentative" name="presentative" placeholder={`Presentative`} 
        value={customerForm.values.presentative} onChange={customerForm.handleChange}></TextInput>
      </div>
      
      <div className="mb-5 flex items-center">
        <input id="discontinued" name="discontinued" type="checkbox" 
        onChange={() => customerForm.setFieldValue("discontinued", !customerForm.values.discontinued)} 
        checked={!customerForm.values.discontinued} 
        className="checkbox checkbox-primary border-gray-400 rounded-md"/>
        <label htmlFor="discontinued" className="ml-2">In Use</label>
      </div>
      <button type="submit" className="mt-1 btn btn-primary w-full text-white">
        <span>{formType} customer</span>
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