import { useState } from "react";
import { BiError, BiCheckDouble } from "react-icons/bi";
import Spinner from "../../../../components/Spinner";
import TextInput from "../../../../components/forms/TextInput";
import api from "../../../../stores/api";
import { useFormik } from "formik";
import SelectInput from "../../../../components/forms/SelectInput";
import Checkbox from "../../../../components/forms/Checkbox";
import { OrderStatus } from "../../../../commons/order-status.enum";
import NumberInput from "../../../../components/forms/NumberInput";
import DateInput from "../../../../components/forms/DateInput";

export default function VendorOrderForm({
  edit,
  initialData, 
  vendors, 
  products,
  updatePrice,
  total,
  onClear
}) {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
  });

  const vendorOrderForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      setFormState(prev => ({...prev, loading: true}));
      try {
        let reqData = {};
        let productOrders = new Map();
        reqData["vendorName"] = data["vendorName"];
        reqData["status"] = data["status"];
        reqData["isTest"] = data["isTest"];
        reqData["expectedAt"] = data["expectedAt"];
        const properties = Object.keys(data).sort();
        for (const property of properties) {
          if (property.includes("price")) {
            const productIndex = +property.replace("price", "");
            const product = products[productIndex];
            productOrders.set(productIndex, {
              "productName": product.name,
              "unitPrice": data[property],
            });
          } else if (property.includes("quantity")) {
            const productIndex = +property.replace("quantity", "");
            productOrders.set(productIndex, {
              ...productOrders.get(productIndex), 
              "quantity": data[property],
            });
          }          
        }
        reqData["productVendorOrders"] = [...productOrders.values()];
        if (edit) {
          reqData["code"] = data["code"];
          const res = await api.put(`/vendor-orders/${reqData["code"]}`, reqData);
          setFormState(prev => ({
            ...prev, 
            success: "Updated order successfully.",
            error: "",
            loading: false,
          }));
          setTimeout(() => {
            setFormState(prev => ({...prev, success: ""}));
            onClear();
          }, 2000);
        } else {
          // create order
          const res = await api.post(`/vendor-orders`, reqData);
          setFormState(prev => ({
            ...prev, 
            success: "Created order successfully.",
            error: "",
            loading: false,
          }));
          setTimeout(() => {
            setFormState(prev => ({...prev, success: ""}));
            onClear();
          }, 2000);
        }
      } catch (e) {
        const error = JSON.parse(JSON.stringify(
          e.response ? e.response.data.error : e
        ));
        setFormState(prev => ({...prev, error: error.message, loading: false}));
      }
    }
  });

  const handlePriceChange = (e, inputId: string) => {
    vendorOrderForm.setFieldValue(inputId, e.target.value);
    updatePrice(e, inputId);
  }

  const onClearForm = () => {
    onClear();
  }

  return (
    <>
      <form onSubmit={vendorOrderForm.handleSubmit}>
        <div className="mb-4">
          <label htmlFor="vendor" className="custom-label inline-block mb-2">Order to vendor</label>
          <SelectInput name="vendor" form={vendorOrderForm} field={"vendorName"} 
          options={vendors.map(vendor => vendor.name)}
          value={vendorOrderForm.values["vendorName"]}
          ></SelectInput>
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="custom-label inline-block mb-2">Status</label>
          <SelectInput name="status" form={vendorOrderForm} field={"status"} 
          options={Object.values(OrderStatus).filter(
            status => status !== OrderStatus.PICKING && 
            status !== OrderStatus.CHECKING && 
            status !== OrderStatus.DELIVERED &&
            status !== OrderStatus.CANCELED
          )}
          value={vendorOrderForm.values["status"]}
          ></SelectInput>
        </div> 

        <div className="mb-8">
          <label htmlFor="expect" className="custom-label block mb-2">Expected delivery date</label>
          <DateInput id="expect" min="2022-01-01" max="2100-12-31"
          name="expect" placeholder="Expected Delivery Date" 
          value={vendorOrderForm.values[`expectedAt`]}
          onChange={(e) => vendorOrderForm.setFieldValue("expectedAt", e.target.value)}
          ></DateInput>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="w-5/12">
            <span className="custom-label">Product</span>
          </div>
          <div className="flex w-7/12">
            <div className="w-6/12 mr-2">
              <span className="custom-label">Qty</span>
            </div>
            <div className="w-6/12">
              <span className="custom-label">Unit price</span>
            </div>
          </div>
        </div>
        {products.map((product, index) => {
          return (
          <div key={index}>
            <div className="flex justify-between items-center mb-4">
              <div className="w-5/12">
                <span>{product.name}</span>
              </div>
              <div className="flex w-7/12">
                <div className="w-6/12 mr-2">
                  <NumberInput id={`quantity${index}`} 
                    name={`quantity${index}`} placeholder="Qty" 
                    value={vendorOrderForm.values[`quantity${index}`]}
                    onChange={(e) => handlePriceChange(e, `quantity${index}`)}
                    min="0" max="99999" disabled={false}
                  ></NumberInput>
                </div>

                <div className="w-6/12">
                  <TextInput id={`price${index}`} type="text" 
                    name={`price${index}`} placeholder="Price" 
                    value={vendorOrderForm.values[`price${index}`]}
                    onChange={(e) => handlePriceChange(e, `price${index}`)}
                  ></TextInput>
                </div>
              </div>

            </div>
            <div className="divider"></div>
          </div>
          )
        })}

        <div className="flex items-center mb-5">
          <div>
            <span className="">Total price:</span>
          </div>
          <span className="text-xl font-medium ml-2">${total}</span>
        </div>

        <div className="mb-5 flex items-center">
          <Checkbox id="test" name="test"
          onChange={() => vendorOrderForm.setFieldValue("isTest", !vendorOrderForm.values["isTest"])} 
          checked={vendorOrderForm.values["isTest"]}
          label="Test"           
          ></Checkbox>
        </div>              
        <button type="submit" className="btn btn-primary text-white w-full mt-1">
          <span>{edit ? "Update" : "Create"} order</span>
        </button>
        <button type="button" className="btn btn-accent text-black w-full mt-3" 
        onClick={onClearForm}>
          <span>Clear change(s)</span>
        </button>
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