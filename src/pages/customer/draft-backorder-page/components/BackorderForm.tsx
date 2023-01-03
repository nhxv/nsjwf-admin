import { useFormik } from "formik";
import { useState } from "react";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import Checkbox from "../../../../components/forms/Checkbox";
import DateInput from "../../../../components/forms/DateInput";
import NumberInput from "../../../../components/forms/NumberInput";
import SelectInput from "../../../../components/forms/SelectInput";
import SelectSearch from "../../../../components/forms/SelectSearch";
import TextInput from "../../../../components/forms/TextInput";
import api from "../../../../stores/api";

export default function BackorderForm({
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

  const backorderForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      setFormState(prev => ({...prev, error: "", success: "", loading: true}));
      try {
        let reqData = {};
        let productOrders = new Map();
        reqData["customerName"] = data["customerName"];
        reqData["assignTo"] = data["employeeName"];
        reqData["isArchived"] = data["isArchived"];
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
        reqData["productBackorders"] = [...productOrders.values()];
        if (edit) {
          reqData["id"] = data["id"];
          if (!reqData["isArchived"]) {
            // update backorder detail
            const res = await api.put(`/backorders/${reqData["id"]}`, reqData);
          } else {
            // convert backorder to customer order
            const res = await api.put(`/backorders/convert/${reqData["id"]}`, reqData);
          }

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
          const res = await api.post(`/backorders`, reqData);
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
    backorderForm.setFieldValue(inputId, e.target.value);
    updatePrice(e, inputId);
  }

  const onClearForm = () => {
    onClear();
  }

  return (
    <>
      <form onSubmit={backorderForm.handleSubmit}>
        <div className="mb-4">
          <label className="custom-label inline-block mb-2">Backorder from customer</label>
          <SelectSearch name="customer" form={backorderForm} field={"customerName"}
          options={customers.map(customer => customer.name)}
          value={backorderForm.values["customerName"]}
          ></SelectSearch>
        </div>

        <div className="mb-4">
          <label htmlFor="employee" className="custom-label inline-block mb-2">Assign to</label>
          <SelectInput name="employee" form={backorderForm} field={"employeeName"} 
          options={employees.map(employee => employee.nickname)}
          value={backorderForm.values["employeeName"]}
          ></SelectInput>
        </div>        

        <div className="mb-8">
          <label htmlFor="expect" className="custom-label inline-block mb-2">Expected delivery date</label>
          <DateInput id="expect" min="2022-01-01" max="2100-12-31"
          name="expect" placeholder="Expected Delivery Date" 
          value={backorderForm.values[`expectedAt`]}
          onChange={(e) => backorderForm.setFieldValue("expectedAt", e.target.value)}
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
                    value={backorderForm.values[`quantity${index}`]}
                    onChange={(e) => handlePriceChange(e, `quantity${index}`)}
                    min="0" max="99999" disabled={false}
                  ></NumberInput>
                </div>

                <div className="w-6/12">
                  <TextInput id={`price${index}`} type="text" 
                    name={`price${index}`} placeholder="Price" 
                    value={backorderForm.values[`price${index}`]}
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
          onChange={() => backorderForm.setFieldValue("isTest", !backorderForm.values["isTest"])} 
          checked={backorderForm.values["isTest"]}
          label="Test"           
          ></Checkbox>
        </div>

        {edit ? (
        <>
          <div className="mb-5 flex items-center">
            <Checkbox id="archive" name="archive"
            onChange={() => backorderForm.setFieldValue("isArchived", !backorderForm.values["isArchived"])} 
            checked={backorderForm.values["isArchived"]}
            label="Convert to normal order"           
            ></Checkbox>
          </div>
        </>) : (<></>)}
               
        <button type="submit" className="btn btn-primary w-full mt-1">
          <span>{edit ? "Update" : "Create"} backorder</span>
        </button>
        <button type="button" 
        className="btn btn-accent w-full mt-3" 
        onClick={onClearForm}>
          <span>Clear change(s)</span>
        </button>
        <div>
          {formState.loading ? (
          <div className="my-5">
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