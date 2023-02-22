import { useFormik } from "formik";
import { useState } from "react";
import Alert from "../../../../components/Alert";
import Checkbox from "../../../../components/forms/Checkbox";
import TextInput from "../../../../components/forms/TextInput";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { BiPlus, BiEditAlt } from "react-icons/bi";
import UnitForm from "./UnitForm";

export default function ProductForm({
  editedId,
  units,
  initialData,
  onClear,
}) {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
  });
  const [modal, setModal] = useState({
    productId: 0,
    unit: null,
    isOpen: false,
  });

  const productForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      setFormState((prev) => ({
        ...prev,
        success: "",
        error: "",
        loading: true,
      }));
      try {
        if (!editedId) {
          const res = await api.post(`/products`, data);
          setFormState((prev) => ({ 
            ...prev, 
            success: "Create product successfully.", 
            error: "", 
            loading: false 
          }));
          setTimeout(() => {
            setFormState(prev => ({...prev, success: "", error: "", loading: false}));
            onClear();
          }, 2000);
        } else {
          const res = await api.put(`/products/${editedId}`, data);
          setFormState((prev) => ({ 
            ...prev, 
            success: "Update product successfully.", 
            error: "", 
            loading: false,
          }));
          setTimeout(() => {
            setFormState(prev => ({...prev, success: "", error: "", loading: false}));
            onClear();
          }, 2000);
        }
      } catch (e) {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFormState((prev) => ({
          ...prev,
          success: "",
          error: error.message,
          loading: false,
        }));
      }
    },
  });

  const onAddUnit = () => {
    setModal(prev => ({...prev, productId: editedId, isOpen: true}));
  }

  const onEditUnit = (unit) => {
    setModal(prev => ({...prev, unit: unit, isOpen: true,}));
  }

  const onCloseUnitForm = () => {
    setModal(prev => ({...prev, isOpen: false, unit: null}));
    onClear();
  }

  return (
    <>
      <form onSubmit={productForm.handleSubmit}>
        <div className="mb-5">
          <label htmlFor="name" className="custom-label mb-2 inline-block">
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

        {editedId ? (
          <>
            <div className="mb-5">
              <p className="custom-label mb-2">Custom unit</p>
              <button type="button" className="btn btn-outline-accent w-full justify-start font-normal p-3" onClick={onAddUnit}>
                <span><BiPlus className="w-6 h-6 mr-2"></BiPlus></span>
                <span>Add a unit</span>
              </button>
            </div>

            {units ? units.map((unit) => (
            <button type="button" key={unit.id} className="mb-5 btn btn-outline-accent p-3 justify-start font-normal w-full" onClick={() => onEditUnit(unit)}>
              <span><BiEditAlt className="w-6 h-6 mr-2"></BiEditAlt></span>
              <span>1 {unit.name} = {unit.ratio} BOX</span>
            </button>)) : null}
          </>
        ) : null}

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
          className="btn-primary btn mt-1 w-full"
          disabled={formState.loading}
        >
          <span>{editedId ? "Edit" : "Create"} product</span>
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
          {formState.success ? (
            <div className="mt-5">
              <Alert message={formState.success} type="success"></Alert>
            </div>
          ) : null}          
        </div>
      </form>
      <UnitForm productId={modal.productId} unit={modal.unit} isOpen={modal.isOpen} onClose={onCloseUnitForm}></UnitForm>
    </>
  );
}
