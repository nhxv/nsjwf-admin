import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { BiCheckDouble, BiError } from "react-icons/bi";
import { CustomerResponse } from "../../../../models/customer-response.model";
import api from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import TextInput from "../../../../components/TextInput";
import { useCustomerConfigStore } from "../../../../stores/customer-config.store";
import { FormType } from "../../../../commons/form-type.enum";
import Checkbox from "../../../../components/Checkbox";

export default function CustomerForm() {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
  });
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
      setFormState(prev => ({
        ...prev, 
        error: "", 
        success: "", 
        loading: true
      }));
      if (formType === FormType.EDIT) {
        // edit mode
        try {
          const res = await api.put<CustomerResponse>(`/customers/${customer.id}`, data);
          setFormState(prev => ({
            ...prev, 
            success: "Updated successfully.", 
            error: "", 
            loading: false
          }));
          setTimeout(() => {
            setFormState(prev => ({...prev, success: ""}));
            clearCustomerConfig();
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
          const res = await api.post<CustomerResponse>(`/customers`, data);
          setFormState(prev => ({
            ...prev, 
            success: "Added successfully", 
            error: "", 
            loading: false
          }));
          setTimeout(() => {
            setFormState(prev => ({...prev, success: ""}));
          }, 2000);
          customerForm.resetForm();
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
    customerForm.values.name = customer.name;
    customerForm.values.address = customer.address,
    customerForm.values.phone = customer.phone,
    customerForm.values.email = customer.email,
    customerForm.values.presentative = customer.presentative;
    customerForm.values.discontinued = customer.discontinued;
  }, [customer]);

  const onClear = () => {
    clearCustomerConfig();
    setFormState(prev => ({...prev, success: "", error: "", loading: false}));
    customerForm.resetForm();
  }

  return (
  <>
    <form onSubmit={customerForm.handleSubmit}>
      <div className="mb-5">
        <label htmlFor="name" className="font-medium inline-block mb-2">
          <span>Name</span>
          <span className="text-red-500">*</span>
        </label>
        <TextInput id="name" type="text" name="name" placeholder={`Name`} 
        value={customerForm.values.name} 
        onChange={customerForm.handleChange}
        ></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="address" className="font-medium inline-block mb-2">Address</label>
        <TextInput id="address" type="text" name="address" placeholder={`Address`} 
        value={customerForm.values.address} 
        onChange={customerForm.handleChange}
        ></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="phone" className="font-medium inline-block mb-2">Phone</label>
        <TextInput id="phone" type="text" name="phone" placeholder={`Phone`} 
        value={customerForm.values.phone} 
        onChange={customerForm.handleChange}
        ></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="email" className="font-medium inline-block mb-2">Email</label>
        <TextInput id="email" type="email" name="email" placeholder={`Email`} 
        value={customerForm.values.email} 
        onChange={customerForm.handleChange}
        ></TextInput>
      </div>

      <div className="mb-5">
        <label htmlFor="presentative" className="font-medium inline-block mb-2">Presentative</label>
        <TextInput id="presentative" type="presentative" name="presentative" placeholder={`Presentative`} 
        value={customerForm.values.presentative} 
        onChange={customerForm.handleChange}
        ></TextInput>
      </div>
      
      <div className="mb-5 flex items-center">
        <Checkbox id="discontinued" name="discontinued"
        onChange={() => customerForm.setFieldValue("discontinued", !customerForm.values.discontinued)}
        checked={!customerForm.values.discontinued}
        label="In use"
        ></Checkbox>
      </div>
      <button type="submit" className="mt-1 btn btn-primary w-full text-white">
        <span>{formType} customer</span>
      </button>
      <button type="button" className="mt-3 btn btn-accent w-full" onClick={onClear}>
        <span>Clear change(s)</span>
      </button>
      <div>
        {formState.loading ? (
        <>
          <div className="my-5 flex justify-center">
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