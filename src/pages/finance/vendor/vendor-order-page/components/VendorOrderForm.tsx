import { useState, useEffect, useMemo } from "react";
import { BiError, BiCheckDouble } from "react-icons/bi";
import Spinner from "../../../../../components/Spinner";
import TextInput from "../../../../../components/TextInput";
import api from "../../../../../stores/api";
import { useFormik } from "formik";
import SelectInput from "../../../../../components/SelectInput";
import Checkbox from "../../../../../components/Checkbox";
import { OrderStatus } from "../../../../../commons/order-status.enum";

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
            if (data[property] === 0) {
              if (edit && initialData[property] > 0) {
                // remove item from order
                productOrders.set(productIndex, {
                  "productName": product.name,
                  "unitPrice": data[property],
                  "isRemove": true, 
                });
              }
            } else {
              productOrders.set(productIndex, {
                "productName": product.name, 
                "unitPrice": data[property],
                "isRemove": false, 
              });
            }
          } else if (property.includes("quantity")) {
            const productIndex = +property.replace("quantity", "");
            if (data[property] === 0) {
              if (edit && initialData[property] > 0) {
                // remove item from order
                productOrders.set(productIndex, {
                  ...productOrders.get(productIndex),
                  "quantity": data[property],
                  "isRemove": true, 
                });
              }
            } else {
              productOrders.set(productIndex, {
                ...productOrders.get(productIndex), 
                "quantity": data[property],
              });
            }
          }
        }
        const productVendorOrders = [];

        for (const productOrder of productOrders.values()) {
          if (productOrder.isRemove || (productOrder.quantity !== 0 && productOrder.unitPrice !== 0)) {
            productVendorOrders.push(productOrder);
          }
        }

        reqData["productVendorOrders"] = productVendorOrders;
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

  const handlePriceBlur = (e, inputId: string) => {
    vendorOrderForm.handleBlur(e);
    updatePrice(e, inputId);
  }

  const onClearForm = () => {
    onClear();
  }

  return (
    <>
      <form onSubmit={vendorOrderForm.handleSubmit}>
        <div className="mb-4">
          <label htmlFor="vendor" className="font-medium inline-block mb-2">Order to vendor</label>
          <SelectInput name="vendor" id="vendor" 
          options={vendors.map(vendor => vendor.name)}
          onChange={(e) => vendorOrderForm.setFieldValue("vendorName", e.target.value)}
          value={vendorOrderForm.values["vendorName"]}
          ></SelectInput>
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="font-medium inline-block mb-2">Status</label>
          <SelectInput name="status" id="status" 
          options={Object.values(OrderStatus).filter(
            status => status !== OrderStatus.PICKING && status !== OrderStatus.CHECKING
          )}
          onChange={(e) => vendorOrderForm.setFieldValue("status", e.target.value)}
          value={vendorOrderForm.values["status"]}
          ></SelectInput>
        </div> 

        <div className="mb-8">
          <label htmlFor="expect" className="font-medium inline-block mb-2">Expected delivery date</label>
          <TextInput id="expect" type="date"
          name="expect" placeholder="Expected Delivery Date" 
          value={vendorOrderForm.values[`expectedAt`]}
          onChange={(e) => vendorOrderForm.setFieldValue("expectedAt", e.target.value)}
          onBlur={vendorOrderForm.handleBlur}></TextInput>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="w-5/12">
            <span className="font-medium">Product</span>
          </div>
          <div className="flex w-7/12">
            <div className="w-6/12 mr-2">
              <span className="font-medium">Qty</span>
            </div>
            <div className="w-6/12">
              <span className="font-medium">Unit price</span>
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
                  <TextInput id={`quantity${index}`} type="number" 
                    name={`quantity${index}`} placeholder="Qty" 
                    value={vendorOrderForm.values[`quantity${index}`]}
                    onChange={vendorOrderForm.handleChange}
                    onBlur={(e) => handlePriceBlur(e, `quantity${index}`)}
                  ></TextInput>
                </div>

                <div className="w-6/12">
                  <TextInput id={`price${index}`} type="text" 
                    name={`price${index}`} placeholder="Price" 
                    value={vendorOrderForm.values[`price${index}`]}
                    onChange={vendorOrderForm.handleChange}
                    onBlur={(e) => handlePriceBlur(e, `price${index}`)}
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