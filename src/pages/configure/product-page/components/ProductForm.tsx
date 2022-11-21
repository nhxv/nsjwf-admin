import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { BiCheckDouble, BiError } from "react-icons/bi";
import { ProductResponse } from "../../../../models/product-response.model";
import api from "../../../../stores/api";
import Spinner from "../../../../components/Spinner";
import TextInput from "../../../../components/TextInput";
import { useProductConfigStore } from "../../../../stores/product-config.store";
import { FormType } from "../../../../commons/form-type.enum";

export default function ProductForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { product, formType } = useProductConfigStore((state) => {
    return state;
  });
  const clearProductConfig = useProductConfigStore((state) => state.clearProductConfig);

  const productForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: (formType === FormType.EDIT ? product.name : ""),
      discontinued: (formType === FormType.EDIT ? product.discontinued : false),
    },
    onSubmit: async (data) => {
      setLoading(true);

      if (formType === FormType.EDIT) {
        // edit mode
        try {
          const res = await api.put<ProductResponse>(`/products/${product.id}`, data);
          setLoading(false);
          setSuccessMessage("Updated successfully.")
          setTimeout(() => {
            setSuccessMessage("");
            clearProductConfig();
          }, 2000);
          productForm.resetForm();
        } catch (e) {
          setLoading(false);
          const error = JSON.parse(JSON.stringify(e));
          setErrorMessage(error.message);
          setTimeout(() => {
            setErrorMessage("");
          }, 2000);
          productForm.resetForm();
        }
      } else if (formType === FormType.ADD) {
        // add mode
        try {
          const res = await api.post<ProductResponse>(`/products`, data);
          setLoading(false);
          setSuccessMessage("Added successfully.")
          setTimeout(() => {
            setSuccessMessage("");
          }, 2000);
          productForm.resetForm();
        } catch (e) {
          setLoading(false);
          const error = JSON.parse(JSON.stringify(e));
          setErrorMessage(error.message);
          setTimeout(() => {
            setErrorMessage("");
          }, 2000);
          productForm.resetForm();
        }
      }
    }
  });

  useEffect(() => {
    productForm.values.name = product.name;
    productForm.values.discontinued = product.discontinued;
  }, [product]);

  const onClear = () => {
    clearProductConfig();
    productForm.resetForm();
  }

  return (
  <>
    <form onSubmit={productForm.handleSubmit}>
      <div className="mb-5">
        <label htmlFor="name" className="font-medium">Name</label>
        <TextInput id="name" type="text" name="name" placeholder={`Name`} 
        value={productForm.values.name} onChange={productForm.handleChange}></TextInput>
      </div>
      <div className="mb-5 flex items-center">
        <input id="discontinued" name="discontinued" type="checkbox" 
        onChange={() => productForm.setFieldValue("discontinued", !productForm.values.discontinued)} 
        checked={!productForm.values.discontinued} 
        className="checkbox checkbox-primary border-gray-400 rounded-md"/>
        <label htmlFor="discontinued" className="ml-2">In use</label>
      </div>
      <button type="submit" className="mt-1 btn btn-primary w-full text-white">
        <span>{formType} product</span>
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