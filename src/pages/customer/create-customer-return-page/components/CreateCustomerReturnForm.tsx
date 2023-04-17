import { useFormik } from "formik";
import { useState } from "react";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import { convertTime } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import NumberInput from "../../../../components/forms/NumberInput";
import SelectInput from "../../../../components/forms/SelectInput";
import TextInput from "../../../../components/forms/TextInput";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";

export default function CreateCustomerReturnForm({
  initialData,
  products,
  sold,
  onClear,
}) {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
    page: 0,
  });

  const customerReturnForm = useFormik({
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
        let reqData = {};
        let productReturns = new Map();
        reqData["customerName"] = data["customerName"];
        reqData["orderCode"] = data["orderCode"];
        reqData["refund"] = data["refund"];
        const properties = Object.keys(data).sort();
        for (const property of properties) {
          if (property.includes("quantity")) {
            const [id, appear] = property.replace("quantity", "").split("-");
            const found = products.find((p) => p.id === +id && p.appear === +appear);
            productReturns.set(`${found.id}-${found.appear}`, {
              productName: found.name,
              quantity: data[property],
            });
          } else if (property.includes("unit")) {
            const [id, appear] = property.replace("unit", "").split("-");
            const found = products.find((p) => p.id === +id && p.appear === +appear);
            productReturns.set(`${found.id}-${found.appear}`, {
              ...productReturns.get(`${found.id}-${found.appear}`),
              unitCode: `${found.id}_${data[property]}`,
            });
          }
        }
        const productCustomerReturns = [...productReturns.values()];
        reqData["productCustomerReturns"] = productCustomerReturns;
        console.log(reqData);
        // create return
        const res = await api.post(`/customer-returns`, reqData);
        setFormState((prev) => ({
          ...prev,
          success: "Created return successfully.",
          error: "",
          loading: false,
        }));
        setTimeout(() => {
          setFormState((prev) => ({ ...prev, success: "" }));
          onClear();
        }, 2000);
      } catch (e) {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFormState((prev) => ({
          ...prev,
          error: error.message,
          success: "",
          loading: false,
        }));
      }
    },
  });

  const onClearForm = () => {
    onClear();
  };

  const onNextPage = () => {
    setFormState((prev) => ({ ...prev, page: 1 }));
  };

  const onPreviousPage = () => {
    setFormState((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <form onSubmit={customerReturnForm.handleSubmit}>
      <div className="mb-3 flex flex-col justify-between">
        <div>
          <span>
            #{sold.order_manual_code ? sold.order_manual_code : sold.order_code}
          </span>
        </div>
        <div>
          <span className="text-xl font-semibold">{sold.customer_name}</span>
        </div>
        <div>
          <span className="text-sm text-neutral">
            Created at {convertTime(new Date(sold.sold_at))}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-12 gap-3">
        {products.map((product) => (
          <div
            key={`${product.id}-${product.appear}`}
            className="rounded-box col-span-12 flex flex-col border-2 border-base-300 p-3 md:col-span-6"
          >
            <div className="mb-3 flex justify-between">
              <div>
                <span className="text-lg font-semibold">{product.name}</span>
                <span className="custom-badge mt-1 block bg-info text-info-content">
                  Sold for ${product.unit_price}/
                  {product.unit_code.split("_")[1].toLowerCase()}
                </span>
              </div>
            </div>
            <div className="mb-2 flex gap-2">
              <div className="w-6/12">
                <label className="custom-label mb-2 inline-block">Qty</label>
                <NumberInput
                  id={`quantity${product.id}-${product.appear}`}
                  placeholder="Qty"
                  name={`quantity${product.id}-${product.appear}`}
                  value={customerReturnForm.values[`quantity${product.id}-${product.appear}`]}
                  onChange={customerReturnForm.handleChange}
                  disabled={formState.page === 1 || customerReturnForm.values[`quantity${product.id}-${product.appear}`] === 0}
                ></NumberInput>
              </div>
              <div className="w-6/12">
                <label className="custom-label mb-2 inline-block">Unit</label>
                <SelectInput
                  name={`unit${product.id}-${product.appear}`}
                  value={customerReturnForm.values[`unit${product.id}-${product.appear}`]}
                  setValue={(v) =>
                    customerReturnForm.setFieldValue(`unit${product.id}-${product.appear}`, v)
                  }
                  options={product.units.map((unit) => unit.code.split("_")[1])}
                ></SelectInput>
              </div>
            </div>
          </div>
        ))}
      </div>

      {formState.page === 1 && (
        <div className="my-5 flex flex-col">
          <label htmlFor="total" className="custom-label mb-2">
            Refund ($)
          </label>
          <div className="w-24">
            <TextInput
              id={`refund`}
              type="text"
              placeholder="Total"
              name={`refund`}
              value={customerReturnForm.values["refund"]}
              onChange={customerReturnForm.handleChange}
            ></TextInput>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <div className="my-3">
          {formState.page === 0 ? (
            <button
              type="button"
              className="btn-primary btn mt-3 w-full"
              onClick={onNextPage}
            >
              <span>Confirm price</span>
              <span>
                <BiRightArrowAlt className="ml-1 h-7 w-7"></BiRightArrowAlt>
              </span>
            </button>
          ) : (
            <>
              {formState.page === 1 && (
                <div className="flex justify-between">
                  <button
                    type="button"
                    className="btn-outline-primary btn w-[49%]"
                    onClick={onPreviousPage}
                  >
                    <span>
                      <BiLeftArrowAlt className="mr-1 h-7 w-7"></BiLeftArrowAlt>
                    </span>
                    <span>Go back</span>
                  </button>
                  <button type="submit" className="btn-primary btn w-[49%]">
                    <span>Create</span>
                    <span>
                      <BiRightArrowAlt className="ml-1 h-7 w-7"></BiRightArrowAlt>
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          className="btn-accent btn w-full"
          disabled={formState.loading}
          onClick={onClearForm}
        >
          <span>Clear change(s)</span>
        </button>
      </div>
      <div>
        {formState.loading && (
          <div className="mt-5">
            <Spinner></Spinner>
          </div>
        )}
        {formState.success && (
          <div className="mt-5">
            <Alert message={formState.success} type="success"></Alert>
          </div>
        )}
        {formState.error && (
          <div className="mt-5">
            <Alert message={formState.error} type="error"></Alert>
          </div>
        )}
      </div>
    </form>
  );
}
