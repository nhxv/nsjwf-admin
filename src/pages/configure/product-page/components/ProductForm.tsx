import { useState } from "react";
import Modal from "../../../../components/Modal";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import TextInput from "../../../../components/forms/TextInput";
import Checkbox from "../../../../components/forms/Checkbox";
import { useFormik } from "formik";
import api from "../../../../stores/api";
import { FormType } from "../../../../commons/form-type.enum";
import { BiX } from "react-icons/bi";

export default function ProductForm({
  isOpen,
  onClose,
  product,
  onReload,
  type,
}) {
  const [formState, setFormState] = useState({
    error: "",
    loading: false,
  });

  const productForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: product.name,
      discontinued: product.discontinued,
    },
    onSubmit: async (data) => {
      setFormState((prev) => ({
        ...prev,
        error: "",
        loading: true,
      }));
      try {
        if (type === FormType.CREATE) {
          const res = await api.post(`/products`, data);
          setFormState((prev) => ({ ...prev, error: "", loading: false }));
          onReload();
          onClose();
        } else if (type === FormType.EDIT) {
          const res = await api.put(`/products/${product.id}`, data);
          setFormState((prev) => ({ ...prev, error: "", loading: false }));
          onReload();
          onClose();
        }
      } catch (e) {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFormState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      }
    },
  });

  const onCloseForm = () => {
    setFormState((prev) => ({ ...prev, error: "", loading: false }));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onCloseForm}>
      <div className="custom-card text-left">
        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-circle btn-accent btn-sm"
            onClick={onCloseForm}
          >
            <BiX className="h-6 w-6"></BiX>
          </button>
        </div>
        <form onSubmit={productForm.handleSubmit}>
          <div className="mb-5">
            <label htmlFor="name" className="custom-label inline-block mb-2">
              <span>Name</span>
              <span className="text-red-500">*</span>
            </label>
            <TextInput
              id="name"
              type="text"
              placeholder={`Name`}
              name="name"
              value={productForm.values.name}
              onChange={productForm.handleChange}
            ></TextInput>
          </div>
          <div className="mb-5 flex items-center">
            <Checkbox
              id="discontinued"
              name="discontinued"
              onChange={() =>
                productForm.setFieldValue(
                  "discontinued",
                  !productForm.values.discontinued
                )
              }
              checked={!productForm.values.discontinued}
              label="In use"
            ></Checkbox>
          </div>
          <button
            type="submit"
            className="mt-1 btn btn-primary w-full"
            disabled={formState.loading}
          >
            <span>{type} product</span>
          </button>
          <div>
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
          </div>
        </form>
      </div>
    </Modal>
  );
}
