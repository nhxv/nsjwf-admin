import { useState } from "react";
import { useFormik } from "formik";
import api from "../../../../stores/api";
import NumberInput from "../../../../components/forms/NumberInput";
import Spinner from "../../../../components/Spinner";
import { BiError, BiRightArrowAlt, BiLeftArrowAlt } from "react-icons/bi";
import { convertTime } from "../../../../commons/time.util";
import TextInput from "../../../../components/forms/TextInput";
import Alert from "../../../../components/Alert";

export default function CreateVendorReturnForm({
  initialData, 
  products,
  sold, 
  updatePrice,
  total, 
  onClear
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
      setFormState(prev => ({...prev, loading: true}));
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
              "productName": product.product_name, 
              "quantity": data[property],
              "unitPrice": product.unit_price,
            });
          }
        }
        const productVendorReturns = [...productReturns.values()];
        reqData["productVendorReturns"] = productVendorReturns;
        // create return
        const res = await api.post(`/vendor-returns`, reqData);
        setFormState(prev => ({
          ...prev, 
          success: "Created return successfully.",
          error: "",
          loading: false,
        }));
        setTimeout(() => {
          setFormState(prev => ({...prev, success: ""}));
          onClear();
        }, 2000);
      } catch (e) {
        const error = JSON.parse(JSON.stringify(
          e.response ? e.response.data.error : e
        ));
        setFormState(prev => ({...prev, error: error.message, loading: false}));
      }
    }
  });

  const handlePriceChange = (e, inputId: string) => {
    vendorReturnForm.setFieldValue(inputId, e.target.value);
    updatePrice(e, inputId);
  }

  const onClearForm = () => {
    onClear();
  }

  const onNextPage = () => {
    setFinalPrice(total);
    setFormState(prev => ({...prev, page: 1}));
  }

  const onPreviousPage = () => {
    setFinalPrice(total);
    setFormState(prev => ({...prev, page: 0}));
  }

  const handleFinalPriceChange = (e) => {
    setFinalPrice(e.target.value);
  }

  return (
    <>
      <form onSubmit={vendorReturnForm.handleSubmit}>
        <div className="mb-3 flex flex-col justify-between">
          <div>
            <span>#{sold.sale_code}</span>
          </div>
          <div>
            <span className="font-semibold text-xl">{sold.vendor_name}</span>
          </div>
          <div className="">
            <span className="text-neutral text-sm">Created at {convertTime(new Date(sold.sold_at))}</span>
          </div>           
        </div>
           
        <div className="divider my-1"></div>  
        <div className="flex justify-between items-center mb-2">
          <div className="w-5/12">
            <span className="custom-label">Product</span>
          </div>
          <div className="flex w-7/12">
            <div className="w-6/12 mr-2">
              <span className="custom-label">Qty</span>
            </div>
            <div className="w-6/12 flex items-center justify-center">
              <span className="custom-label">Unit price</span>
            </div>
          </div>
        </div>
        {products.map((product, index) => {
          return (
          <div key={index}>
            <div className="flex justify-between items-center">
              <div className="w-5/12">
                <span>{product.product_name}</span>
              </div>
              <div className="flex w-7/12">
                <div className="w-6/12 mr-2">
                  <NumberInput id={`quantity${index}`} 
                    name={`quantity${index}`} placeholder="Qty" 
                    value={vendorReturnForm.values[`quantity${index}`]}
                    onChange={(e) => handlePriceChange(e, `quantity${index}`)}
                    min="0" max={product.quantity} 
                    disabled={product.quantity === 0 || formState.page === 1 ? true : false}
                  ></NumberInput>
                </div>

                <div className="w-6/12 flex items-center justify-center">
                  <span>{product.unit_price}</span>
                </div>
              </div>

            </div>
            <div className="divider my-1"></div>
          </div>
          )
        })}
        {formState.page === 1 ? (        
        <div className="flex flex-col my-5">
          <label htmlFor="total" className="custom-label mb-2">Refund ($)</label>
          <div className="w-24">
            <TextInput id={`total`} type="text" name={`total`} placeholder="Total" 
              value={finalPrice} onChange={(e) => handleFinalPriceChange(e)}
            ></TextInput>
          </div>
        </div>) : null}

        <div className="flex flex-col">
          <div className="my-3">
            {formState.page === 0 ? 
            (<button type="button" className="btn btn-primary w-full" onClick={onNextPage}>
              <span>Confirm price</span>
              <span><BiRightArrowAlt className="w-7 h-7 ml-1"></BiRightArrowAlt></span>
            </button>) : 
            (<>
            {formState.page === 1 ? (
            <div className="flex justify-between">
              <button type="button" className="btn btn-alt w-[49%]" onClick={onPreviousPage}>
                <span><BiLeftArrowAlt className="w-7 h-7 mr-1"></BiLeftArrowAlt></span>
                <span>Go back</span>
              </button>
              <button type="submit" className="btn btn-primary w-[49%]">
                <span>Create</span>
                <span><BiRightArrowAlt className="w-7 h-7 ml-1"></BiRightArrowAlt></span>
              </button>
            </div>
            ) : (<></>)}
            </>)}
          </div>
          <div>
            <button type="button" className="btn btn-accent w-full" onClick={onClearForm}>
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
  )
}