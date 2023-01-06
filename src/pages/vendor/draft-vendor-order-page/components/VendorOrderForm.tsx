import { useFormik } from "formik";
import { useState } from "react";
import { OrderStatus } from "../../../../commons/order-status.enum";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import Checkbox from "../../../../components/forms/Checkbox";
import DateInput from "../../../../components/forms/DateInput";
import NumberInput from "../../../../components/forms/NumberInput";
import SelectInput from "../../../../components/forms/SelectInput";
import SelectSearch from "../../../../components/forms/SelectSearch";
import TextInput from "../../../../components/forms/TextInput";
import api from "../../../../stores/api";

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
            const id = +property.replace("price", "");
            const product = products.find(p => p.id === id);
            productOrders.set(product.id, {
              "productName": product.name,
              "unitPrice": data[property],
            });
          } else if (property.includes("quantity")) {
            const id = +property.replace("quantity", "");
            productOrders.set(id, {
              ...productOrders.get(id), 
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
          <label className="custom-label inline-block mb-2">
            <span>Order to vendor</span>
            <span className="text-red-500">*</span>
          </label>
          <SelectSearch name="vendor" form={vendorOrderForm} field={"vendorName"} 
          options={vendors.map(vendor => vendor.name)}
          value={vendorOrderForm.values["vendorName"]}
          ></SelectSearch>
        </div>

        <div className="mb-4">
          <label className="custom-label inline-block mb-2">Status</label>
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
        {products.map((product) => {
          return (
          <div key={product.id}>
            <div className="flex justify-between items-center mb-4">
              <div className="w-5/12">
                <span>{product.name}</span>
              </div>
              <div className="flex w-7/12">
                <div className="w-6/12 mr-2">
                  <NumberInput id={`quantity${product.id}`} 
                    name={`quantity${product.id}`} placeholder="Qty" 
                    value={vendorOrderForm.values[`quantity${product.id}`]}
                    onChange={(e) => handlePriceChange(e, `quantity${product.id}`)}
                    min="0" max="99999" disabled={false}
                  ></NumberInput>
                </div>

                <div className="w-6/12">
                  <TextInput id={`price${product.id}`} type="text" 
                    name={`price${product.id}`} placeholder="Price" 
                    value={vendorOrderForm.values[`price${product.id}`]}
                    onChange={(e) => handlePriceChange(e, `price${product.id}`)}
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
        <button type="submit" className="btn btn-primary w-full mt-1">
          <span>{edit ? "Update" : "Create"} order</span>
        </button>
        <button type="button" className="btn btn-accent w-full mt-3" 
        onClick={onClearForm}>
          <span>Clear change(s)</span>
        </button>
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