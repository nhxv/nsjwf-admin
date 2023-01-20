import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { FormType } from "../../../../commons/form-type.enum";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import Checkbox from "../../../../components/forms/Checkbox";
import TextInput from "../../../../components/forms/TextInput";
import { ProductResponse } from "../../../../models/product-response.model";
import api from "../../../../stores/api";
import { useProductConfigStore } from "../../../../stores/product-config.store";

export default function ProductForm() {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
  });
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
      setFormState(prev => ({
        ...prev, 
        error: "", 
        success: "", 
        loading: true
      }));
      if (formType === FormType.EDIT) {
        // edit mode
        try {
          const res = await api.put<ProductResponse>(`/products/${product.id}`, data);
          setFormState(prev => ({
            ...prev, 
            success: "Updated successfully.", 
            error: "", 
            loading: false
          }));
          setTimeout(() => {
            setFormState(prev => ({...prev, success: ""}));
            clearProductConfig();
          }, 2000);
        } catch (e) {
          const error = JSON.parse(JSON.stringify(
            e.response ? e.response.data.error : e
          ));
          setFormState(prev => ({...prev, error: error.message, loading: false}));
        }
      } else if (formType === FormType.CREATE) {
        // add mode
        try {
          const res = await api.post<ProductResponse>(`/products`, data);
          setFormState(prev => ({
            ...prev, 
            success: "Added successfully.", 
            error: "", 
            loading: false
          }));
          setTimeout(() => {
            setFormState(prev => ({...prev, success: ""}));
          }, 2000);
          productForm.resetForm();
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
    productForm.values.name = product.name;
    productForm.values.discontinued = product.discontinued;
  }, [product]);

  const onClear = () => {
    clearProductConfig();
    setFormState(prev => ({...prev, success: "", error: "", loading: false}));
    productForm.resetForm();
  }

  return (
  <>
    <form onSubmit={productForm.handleSubmit}>
      <div className="mb-5">
        <label htmlFor="name" className="custom-label inline-block mb-2">
          <span>Name</span>
          <span className="text-red-500">*</span>
        </label>
        <TextInput id="name" type="text" name="name" placeholder={`Name`} 
        value={productForm.values.name} 
        onChange={productForm.handleChange}
        ></TextInput>
      </div>
      <div className="mb-5 flex items-center">
        <Checkbox id="discontinued" name="discontinued"
        onChange={() => productForm.setFieldValue("discontinued", !productForm.values.discontinued)} 
        checked={!productForm.values.discontinued}
        label="In use" 
        ></Checkbox>
      </div>
      <button type="submit" className="mt-1 btn btn-primary w-full" disabled={formState.loading}>
        <span>{formType} product</span>
      </button>
      <button type="button" className="mt-3 btn btn-accent w-full" onClick={onClear}>
        <span>Clear change(s)</span>
      </button>
      <div>
        {formState.loading ? (
        <div className="mt-5">
          <Spinner></Spinner>
        </div>
        ) : null}
        {formState.success ? (
        <div className="mt-5">
          <Alert message={formState.success} type="success"></Alert>
        </div>
        ) : null}
        {formState.error ? (
        <div className="mt-5">
          <Alert message={formState.error} type="error"></Alert>
        </div>
        ) : null}
      </div>
    </form>
  </>
  )
}