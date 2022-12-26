import { useState } from "react";
import { useFormik } from "formik";
import api from "../../../../stores/api";
import NumberInput from "../../../../components/forms/NumberInput";
import Spinner from "../../../../components/Spinner";
import { BiError, BiCheckDouble, BiRightArrowAlt, BiLeftArrowAlt } from "react-icons/bi";
import { convertTime } from "../../../../commons/time.util";
import TextInput from "../../../../components/forms/TextInput";

export default function CreateCustomerReturnForm({
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

  const customerReturnForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      setFormState(prev => ({...prev, loading: true}));
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
              "productName": product.product_name, 
              "quantity": data[property],
              "unitPrice": product.unit_price,
            });
          }
        }
        const productCustomerReturns = [...productReturns.values()];
        reqData["productCustomerReturns"] = productCustomerReturns;
        // create return
        const res = await api.post(`/customer-returns`, reqData);
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
    customerReturnForm.setFieldValue(inputId, e.target.value);
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
      <form onSubmit={customerReturnForm.handleSubmit}>
        <div className="mb-4 flex flex-col justify-between">
          <div>
            <span>#{sold.sale_code}</span>
          </div>
          <div>
            <span className="font-semibold text-xl">{sold.customer_name}</span>
          </div>
          <div className="">
            <span className="text-gray-400 text-sm">Created at {convertTime(new Date(sold.sold_at))}</span>
          </div>           
        </div>
           
        <div className="divider"></div>  
        <div className="flex justify-between items-center mb-4">
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
            <div className="flex justify-between items-center mb-4">
              <div className="w-5/12">
                <span>{product.product_name}</span>
              </div>
              <div className="flex w-7/12">
                <div className="w-6/12 mr-2">
                  <NumberInput id={`quantity${index}`} 
                    name={`quantity${index}`} placeholder="Qty" 
                    value={customerReturnForm.values[`quantity${index}`]}
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
            <div className="divider"></div>
          </div>
          )
        })}
        {formState.page === 1 ? (        
        <div className="flex flex-col mb-5">
          <label htmlFor="total" className="custom-label mb-2">Refund ($)</label>
          <div className="w-24">
            <TextInput id={`total`} type="text" name={`total`} placeholder="Total" 
              value={finalPrice} onChange={(e) => handleFinalPriceChange(e)}
            ></TextInput>
          </div>

        </div>) :(<></>)}

        <div className="flex flex-col">
          <div className="mt-1">
            {formState.page === 0 ? 
            (<>
            <button type="button" className="btn btn-primary text-white w-full" onClick={onNextPage}>
              <span>Confirm price</span>
              <span><BiRightArrowAlt className="w-7 h-7 ml-1"></BiRightArrowAlt></span>
            </button>
            </>) : 
            (<>
            {formState.page === 1 ? (
            <div className="flex justify-between">
              <button type="button" className="btn btn-alt w-[49%]" onClick={onPreviousPage}>
                <span><BiLeftArrowAlt className="w-7 h-7 mr-1"></BiLeftArrowAlt></span>
                <span>Go back</span>
              </button>
              <button type="submit" className="btn btn-primary text-white w-[49%]">
                <span>Create</span>
                <span><BiRightArrowAlt className="w-7 h-7 ml-1"></BiRightArrowAlt></span>
              </button>
            </div>
            ) : (<></>)}
            </>)}
          </div>
          <div>
            <button type="button" className="btn btn-accent text-black w-full mt-3" onClick={onClearForm}>
              <span>Clear change(s)</span>
            </button>
          </div>
        </div>
        <div>
          {formState.loading ? (
          <>
            <div className="mt-5 flex justify-center">
              <Spinner></Spinner>
            </div>
          </>
          ) : (<></>)}
          {formState.success ? (
          <>
            <div className="mt-5 alert alert-success text-green-700 flex justify-center">
              <div>
                <BiCheckDouble className="flex-shrink-0 w-6 h-6"></BiCheckDouble>
                <span>{formState.success}</span>
              </div>
            </div>
          </>
          ) : (<></>)}
          {formState.error ? (
          <>
            <div className="mt-5 alert alert-error text-red-700 flex justify-center">
              <div>
                <BiError className="flex-shrink-0 w-6 h-6"></BiError>
                <span>{formState.error}</span>
              </div>
            </div>        
          </>
          ) : (<></>)}
        </div>
      </form>        
    </>
  )
}