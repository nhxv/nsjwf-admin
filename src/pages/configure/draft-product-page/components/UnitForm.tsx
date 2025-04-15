import { useFormik } from "formik";
import { useState } from "react";
import { BiX } from "react-icons/bi";
import Alert from "../../../../components/Alert";
import Checkbox from "../../../../components/forms/Checkbox";
import TextInput from "../../../../components/forms/TextInput";
import Modal from "../../../../components/Modal";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { useNavigate } from "react-router-dom";
import { handleTokenExpire } from "../../../../commons/utils/token.util";

export default function DraftUnitForm({ productId, unit, isOpen, onClose }) {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    error: "",
    loading: false,
  });

  const unitForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: unit ? unit.name : "",
      ratio: "1/2",
      discontinued: unit ? unit.discontinued : false,
    },
    onSubmit: async (data) => {
      setFormState((prev) => ({ ...prev, loading: true, error: "" }));
      try {
        let res = null;
        if (unit?.id > 0) {
          res = await api.put(`/units/${unit.id}`, data);
          if (res) {
            setFormState((prev) => ({ ...prev, loading: false, error: "" }));
            onCloseForm();
          }
        } else {
          res = await api.post(`/units/by-product/${productId}`, data);
          if (res) {
            setFormState((prev) => ({ ...prev, loading: false, error: "" }));
            onCloseForm();
          }
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

        if (error.status === 401) {
          handleTokenExpire(navigate, setFormState);
        }
      }
    },
  });

  const onCloseForm = () => {
    unitForm.resetForm();
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
            <span>
              <BiX className="h-6 w-6"></BiX>
            </span>
          </button>
        </div>
        <form onSubmit={unitForm.handleSubmit}>
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
              value={unitForm.values.name}
              onChange={unitForm.handleChange}
            ></TextInput>
          </div>

          {!unit && (
            <div className="mb-5">
              <label htmlFor="ratio" className="custom-label mb-2 inline-block">
                <span>Ratio to box</span>
                <span className="text-red-500">*</span>
              </label>
              <TextInput
                id="ratio"
                type="text"
                placeholder={`1/4`}
                name="ratio"
                value={unitForm.values.ratio}
                onChange={unitForm.handleChange}
              ></TextInput>
            </div>
          )}

          <div className="mb-5 flex items-center">
            <Checkbox
              id="discontinued"
              name="discontinued"
              onChange={() =>
                unitForm.setFieldValue(
                  "discontinued",
                  !unitForm.values.discontinued
                )
              }
              checked={!unitForm.values.discontinued}
              label="In use"
            ></Checkbox>
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-3 w-full"
            disabled={formState.loading}
          >
            <span>{unit ? "Edit" : "Add"} unit</span>
          </button>
          <div>
            {formState.loading && (
              <div className="mt-5">
                <Spinner></Spinner>
              </div>
            )}
            {formState.error && (
              <div className="mt-5">
                <Alert message={formState.error} type="error"></Alert>
              </div>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}
