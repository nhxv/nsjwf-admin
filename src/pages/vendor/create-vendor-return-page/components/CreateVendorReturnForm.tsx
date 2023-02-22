import { useFormik } from "formik";
import { useState } from "react";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import { convertTime } from "../../../../commons/utils/time.util";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import NumberInput from "../../../../components/forms/NumberInput";
import TextInput from "../../../../components/forms/TextInput";
import api from "../../../../stores/api";

export default function CreateVendorReturnForm({
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
    page: 0,
    loading: false,
  });
  const [finalPrice, setFinalPrice] = useState(0);

  const vendorReturnForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      setFormState((prev) => ({
        ...prev,
        error: "",
        success: "",
        loading: true,
      }));
      try {
        let reqData = {};
        let productReturns = new Map();
        reqData["vendorName"] = data["vendorName"];
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
        const productVendorReturns = [...productReturns.values()];
        reqData["productVendorReturns"] = productVendorReturns;
        // create return
        const res = await api.post(`/vendor-returns`, reqData);
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
    vendorReturnForm.setFieldValue(inputId, e.target.value);
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
    <>
      <form onSubmit={vendorReturnForm.handleSubmit}>
        <div className="mb-3 flex flex-col justify-between">
          <div>
            <span>#{sold.sale_code}</span>
          </div>
          <div>
            <span className="text-xl font-semibold">{sold.vendor_name}</span>
          </div>
          <div className="">
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
          <div className="flex w-7/12 gap-2">
            <div className="w-6/12">
              <span className="custom-label">Qty</span>
            </div>
            <div className="flex w-6/12 items-center justify-center">
              <span className="custom-label">Price</span>
            </div>
          </div>
        </div>
        {products.map((product, index) => {
          return (
            <div key={index}>
              <div className="flex items-center justify-between">
                <div className="w-5/12">
                  <span>{product.product_name}</span>
                  <span className="custom-badge mt-1 block bg-info text-info-content">
                    Sold in {product.unit_code.split("_")[1].toLowerCase()}
                  </span>
                </div>
                <div className="flex w-7/12 gap-2">
                  <div className="flex w-6/12 items-center gap-2">
                    <NumberInput
                      id={`quantity${index}`}
                      name={`quantity${index}`}
                      placeholder="Qty"
                      value={vendorReturnForm.values[`quantity${index}`]}
                      onChange={(e) => handlePriceChange(e, `quantity${index}`)}
                      min="0"
                      max={product.quantity}
                      disabled={
                        !!(product.quantity === 0 || formState.page === 1)
                      }
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
                    <button
                      type="submit"
                      className="btn-primary btn w-[49%]"
                      disabled={formState.loading}
                    >
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
          <div>
            <button
              type="button"
              className="btn-accent btn w-full"
              onClick={onClearForm}
            >
              <span>Clear change(s)</span>
            </button>
          </div>
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
    </>
  );
}
