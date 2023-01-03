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

export default function CustomerOrderForm({
  edit,
  initialData, 
  customers, 
  products,
  employees,
  updatePrice,
  total,
  onClear
}) {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
  });

  const customerOrderForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      setFormState(prev => ({...prev, loading: true}));
      try {
        let reqData = {};
        let productOrders = new Map();
        reqData["customerName"] = data["customerName"];
        reqData["assignTo"] = data["employeeName"];
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
        reqData["productCustomerOrders"] = [...productOrders.values()];
        if (edit) {
          // edit order
          reqData["code"] = data["code"];
          const res = await api.put(`/customer-orders/${reqData["code"]}`, reqData);
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
          const res = await api.post(`/customer-orders`, reqData);
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
    customerOrderForm.setFieldValue(inputId, e.target.value);
    updatePrice(e, inputId);
  }

  const onClearForm = () => {
    onClear();
  }

  return (
    <>
      <form onSubmit={customerOrderForm.handleSubmit}>
        <div className="mb-4">
          <label className="custom-label inline-block mb-2">Order from customer</label>
          <SelectSearch name="customer" form={customerOrderForm} field={"customerName"} 
          options={customers.map(customer => customer.name)}
          value={customerOrderForm.values["customerName"]} />
        </div>

        <div className="mb-4">
          <label htmlFor="employee" className="custom-label inline-block mb-2">Assign to</label>
          <SelectInput name="employee" form={customerOrderForm} field={"employeeName"}
          options={employees.map(employee => employee.nickname)}
          value={customerOrderForm.values["employeeName"]}
          ></SelectInput>
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="custom-label inline-block mb-2">Status</label>
          <SelectInput name="status" form={customerOrderForm} field={"status"} 
          options={Object.values(OrderStatus).filter(status => status !== OrderStatus.CANCELED)}
          value={customerOrderForm.values["status"]}
          ></SelectInput>
        </div>

        <div className="mb-8">
          <label htmlFor="expect" className="custom-label inline-block mb-2">Expected delivery date</label>
          <DateInput id="expect" min="2022-01-01" max="2100-12-31"
          name="expect" placeholder="Expected Delivery Date" 
          value={customerOrderForm.values[`expectedAt`]}
          onChange={(e) => customerOrderForm.setFieldValue("expectedAt", e.target.value)}
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
                    value={customerOrderForm.values[`quantity${index}`]}
                    onChange={(e) => handlePriceChange(e, `quantity${index}`)}
                    min="0" max="99999" disabled={false}
                  ></NumberInput>
                </div>

                <div className="w-6/12">
                  <TextInput id={`price${index}`} type="text" 
                    name={`price${index}`} placeholder="Price" 
                    value={customerOrderForm.values[`price${index}`]}
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
          onChange={() => customerOrderForm.setFieldValue("isTest", !customerOrderForm.values["isTest"])} 
          checked={customerOrderForm.values["isTest"]}
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