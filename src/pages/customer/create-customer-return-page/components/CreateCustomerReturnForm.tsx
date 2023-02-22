import { useFormik } from "formik";
import { useState } from "react";
import {
  BiLeftArrowAlt,
  BiRightArrowAlt
} from "react-icons/bi";
import { convertTime } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import NumberInput from "../../../../components/forms/NumberInput";
import TextInput from "../../../../components/forms/TextInput";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";

export default function CreateCustomerReturnForm({
  initialData,
  products,
  sold,
  updatePrice,
  total,
  onClear,
}) {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
    page: 0,
  });
  const [finalPrice, setFinalPrice] = useState(0);

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
        reqData["recommendedPrice"] = total;
        reqData["finalPrice"] = finalPrice;
        const properties = Object.keys(data).sort();
        for (const property of properties) {
          if (property.includes("quantity")) {
            const productIndex = +property.replace("quantity", "");
            const product = products[productIndex];
            productReturns.set(productIndex, {
              ...productReturns.get(productIndex),
              productName: product.product_name,
              quantity: data[property],
              unitCode: product.unit_code,
              unitPrice: product.unit_price,
            });
          }
        }
        const productCustomerReturns = [...productReturns.values()];
        reqData["productCustomerReturns"] = productCustomerReturns;
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

  const handlePriceChange = (e, inputId: string) => {
    customerReturnForm.setFieldValue(inputId, e.target.value);
    updatePrice(e, inputId);
  };

  const onClearForm = () => {
    onClear();
  };

  const onNextPage = () => {
    setFinalPrice(total);
    setFormState((prev) => ({ ...prev, page: 1 }));
  };

  const onPreviousPage = () => {
    setFinalPrice(total);
    setFormState((prev) => ({ ...prev, page: 0 }));
  };

  const handleFinalPriceChange = (e) => {
    setFinalPrice(e.target.value);
  };

  return (
    <form onSubmit={customerReturnForm.handleSubmit}>
      <div className="mb-3 flex flex-col justify-between">
        <div>
          <span>
            #{sold.sale_manual_code ? sold.sale_manual_code : sold.sale_code}
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

      <div className="divider my-1"></div>
      <div className="mb-2 flex items-center justify-between">
        <div className="w-5/12">
          <span className="custom-label">Product</span>
        </div>
        <div className="flex gap-2 w-7/12">
          <div className="w-6/12">
            <span className="custom-label">Qty</span>
          </div>
          <div className="flex w-6/12 items-center justify-center">
            <span className="custom-label">Unit price</span>
          </div>
        </div>
      </div>
      {products.map((product, index) => {
        return (
          <div key={index}>
            <div className="flex items-center justify-between">
              <div className="w-5/12">
                <span>{product.product_name}</span>
                <span className="block custom-badge bg-info text-info-content mt-1">Sold in {product.unit_code.split("_")[1].toLowerCase()}</span>
              </div>
              <div className="flex gap-2 w-7/12">
                <div className="w-6/12">
                  <NumberInput
                    id={`quantity${index}`}
                    min="0"
                    max={product.quantity}
                    placeholder="Qty"
                    name={`quantity${index}`}
                    value={customerReturnForm.values[`quantity${index}`]}
                    onChange={(e) => handlePriceChange(e, `quantity${index}`)}
                    disabled={!!(product.quantity === 0 || formState.page === 1)}
                  ></NumberInput>
                </div>

                <div className="flex w-6/12 items-center justify-center">
                  <span>${product.unit_price}</span>
                </div>
              </div>
            </div>
            <div className="divider my-1"></div>
          </div>
        );
      })}
      {formState.page === 1 ? (
        <div className="my-5 flex flex-col">
          <label htmlFor="total" className="custom-label mb-2">
            Refund ($)
          </label>
          <div className="w-24">
            <TextInput
              id={`total`}
              type="text"
              name={`total`}
              placeholder="Total"
              value={finalPrice}
              onChange={(e) => handleFinalPriceChange(e)}
            ></TextInput>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col">
        <div className="my-3">
          {formState.page === 0 ? (
            <button
              type="button"
              className="btn-primary btn w-full mt-3"
              onClick={onNextPage}
            >
              <span>Confirm price</span>
              <span>
                <BiRightArrowAlt className="ml-1 h-7 w-7"></BiRightArrowAlt>
              </span>
            </button>
          ) : (
            <>
              {formState.page === 1 ? (
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
              ) : null}
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
  );
}
