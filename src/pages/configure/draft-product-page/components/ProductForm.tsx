import { useFormik } from "formik";
import { useState } from "react";
import { BiEditAlt, BiPlus } from "react-icons/bi";
import { Location } from "../../../../commons/enums/location.enum";
import Alert from "../../../../components/Alert";
import Checkbox from "../../../../components/forms/Checkbox";
import SelectInput from "../../../../components/forms/SelectInput";
import TextInput from "../../../../components/forms/TextInput";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import UnitForm from "./UnitForm";

export default function ProductForm({ editedId, units, initialData, onClear }) {
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
            loading: false,
          }));
          setTimeout(() => {
            setFormState((prev) => ({
              ...prev,
              success: "",
              error: "",
              loading: false,
            }));
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
            setFormState((prev) => ({
              ...prev,
              success: "",
              error: "",
              loading: false,
            }));
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
    setModal((prev) => ({ ...prev, productId: editedId, isOpen: true }));
  };

  const onEditUnit = (unit) => {
    setModal((prev) => ({ ...prev, unit: unit, isOpen: true }));
  };

  const onCloseUnitForm = () => {
    setModal((prev) => ({ ...prev, isOpen: false, unit: null }));
    onClear();
  };

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
        <div className="mb-5">
          <label className="custom-label mb-2 inline-block">Location</label>
          <SelectInput
            form={productForm}
            field={`location`}
            name={`location`}
            options={Object.values(Location)}
            selected={productForm.values[`location`]}
          ></SelectInput>
        </div>

        {editedId ? (
          <>
            <div className="mb-5">
              <p className="custom-label mb-2">Custom unit</p>
              <button
                type="button"
                className="btn-outline-accent btn w-full justify-start p-3 font-normal"
                onClick={onAddUnit}
              >
                <span>
                  <BiPlus className="mr-2 h-6 w-6"></BiPlus>
                </span>
                <span>Add a unit</span>
              </button>
            </div>

            {units
              ? units.map((unit) => (
                  <button
                    type="button"
                    key={unit.id}
                    className="btn-outline-accent btn mb-5 w-full justify-start p-3 font-normal"
                    onClick={() => onEditUnit(unit)}
                  >
                    <span>
                      <BiEditAlt className="mr-2 h-6 w-6"></BiEditAlt>
                    </span>
                    <span>
                      1 {unit.name} = {unit.ratio} BOX
                    </span>
                  </button>
                ))
              : null}
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
      <UnitForm
        productId={modal.productId}
        unit={modal.unit}
        isOpen={modal.isOpen}
        onClose={onCloseUnitForm}
      ></UnitForm>
    </>
  );
}
