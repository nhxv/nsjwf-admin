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
import { BiLeftArrowAlt, BiRightArrowAlt, BiTrash } from "react-icons/bi";
import SearchInput from "../../../../components/forms/SearchInput";

export default function BackorderForm({
  edit,
  initialData, 
  customers, 
  editedProducts,
  allProducts,
  employees,
  updatePrice,
  total,
  loadTemplate,
  onClear
}) {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
    page: 0,
  });

  const [query, setQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState(editedProducts ? editedProducts : []);
  const [searchedProducts, setSearchedProducts] = useState([]);

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
            const id = +property.replace("price", "");
            const selected = selectedProducts.find(p => p.id === id);
            if (selected) {
              productOrders.set(selected.id, {
                "productName": selected.name,
                "unitPrice": data[property],
              });
            }
          } else if (property.includes("quantity")) {
            const id = +property.replace("quantity", "");
            const selected = selectedProducts.find(p => p.id === id);
            if (selected) {
              productOrders.set(id, {
                ...productOrders.get(id), 
                "quantity": data[property],
              });
            }
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

  const onNextPage = async () => {
    if (!edit) {
      setFormState(prev => ({...prev, error: "", empty: "", loading: true}));
      const template = await loadTemplate(backorderForm.values[`customerName`]);
      const selected = [];
      for (const product of template) {
        const found = allProducts.find(p => p.name === product.name);
        selected.push({id: found.id, name: product.name});
        backorderForm.setFieldValue(`quantity${found.id}`, product.quantity);
        backorderForm.setFieldValue(`price${found.id}`, 0);
      }
      setSelectedProducts(selected);
      setFormState(prev => ({...prev, error: "", empty: "", loading: false}));
    }
    setFormState(prev => ({...prev, page: 1}));
  }

  const onPreviousPage = () => {
    setFormState(prev => ({...prev, page: 0}));
  }  

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = allProducts.filter(product => product.name.toLowerCase().replace(/\s+/g, "").includes(e.target.value.toLowerCase().replace(/\s+/g, "")));
      setSearchedProducts(searched);
    } else {
      setSearchedProducts([]);
    }
    setQuery(e.target.value);
  }

  const onAddProduct = (product) => {
    const found = selectedProducts.find(p => p.name === product.name);
    if (!found) {
      setSelectedProducts([product, ...selectedProducts]);
      backorderForm.setFieldValue(`quantity${product.id}`, 0);
      backorderForm.setFieldValue(`price${product.id}`, 0);
      setSearchedProducts([]);
      setQuery("");
    }
  }

  const onRemoveProduct = (id) => {
    setSearchedProducts([]);
    setQuery("");
    backorderForm.setFieldValue(`quantity${id}`, 0);
    backorderForm.setFieldValue(`price${id}`, 0);
    updatePrice(0, `remove${id}`);
    setSelectedProducts(selectedProducts.filter(product => product.id !== id));
  }

  const onClearQuery = () => {
    setSearchedProducts([]);
    setQuery("");
  }  

  return (
    <>
      <form onSubmit={backorderForm.handleSubmit}>
        {formState.page === 0 ? (
        <>
          {/* 1st page */}
          <div className="mb-5">
            <label className="custom-label inline-block mb-2">
              <span>Order from customer</span>
              <span className="text-red-500">*</span>
            </label>
            <SelectSearch name="customer" form={backorderForm} field={"customerName"} 
            options={customers.map(customer => customer.name)}
            value={backorderForm.values["customerName"]} />
          </div>

          <div className="mb-5">
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

          <button type="button" className="mt-1 btn btn-primary w-full" onClick={onNextPage}
          disabled={!backorderForm.values[`customerName`]}>
            <span>Set product</span>
            <span><BiRightArrowAlt className="w-7 h-7 ml-1"></BiRightArrowAlt></span>
          </button>        
        </>) : (
        <>
          {formState.page === 1 ? (
          <>
            <div className="mb-5">
              <div className="flex justify-between items-center">
                <div className="w-full">
                  <SearchInput id="product-search" name="product-search" placeholder="Search product"
                  onChange={(e) => onChangeSearch(e)} value={query} onFocus={() => setSearchedProducts(allProducts)}
                  onClear={onClearQuery}></SearchInput>
                </div>
              </div>
              {searchedProducts.length > 0 ? (
              <div className="my-2 border border-base-300 rounded-btn p-2 shadow-md">
                {searchedProducts.map((product, index) => (
                <div key={index} className="cursor-pointer w-full p-3 rounded-btn hover:bg-info"
                onClick={() => onAddProduct(product)}>
                  <p>{product.name}</p>
                </div>
                ))}
              </div>) : null}
              {searchedProducts?.length === 0 && query ? (
              <div className="my-2 border border-base-300 rounded-btn p-2 shadow-md">
                <p className="p-3">Not found.</p>
              </div>) : null}
            </div>
            {selectedProducts?.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="w-5/12">
                  <span className="custom-label">Product</span>
                </div>
                <div className="flex w-7/12">
                  <div className="w-5/12 mr-2">
                    <span className="custom-label">Qty</span>
                  </div>
                  <div className="w-5/12">
                    <span className="custom-label">Price</span>
                  </div>
                </div>
              </div>            
            </>) : (
            <div className="flex justify-center">
              <span>Empty.</span>
            </div>)}

            {selectedProducts.map((product) => {
            return (
            <div key={product.id}>
              <div className="flex justify-between items-center mb-4">
                <div className="w-5/12">
                  <span>{product.name}</span>
                </div>
                <div className="flex w-7/12">
                  <div className="w-5/12 mr-2">
                    <NumberInput id={`quantity${product.id}`} 
                      name={`quantity${product.id}`} placeholder="Qty" 
                      value={backorderForm.values[`quantity${product.id}`]}
                      onChange={(e) => handlePriceChange(e, `quantity${product.id}`)}
                      min="0" max="99999" disabled={false}
                    ></NumberInput>
                  </div>

                  <div className="w-5/12 mr-2">
                    <TextInput id={`price${product.id}`} type="text" 
                      name={`price${product.id}`} placeholder="Price" 
                      value={backorderForm.values[`price${product.id}`]}
                      onChange={(e) => handlePriceChange(e, `price${product.id}`)}
                    ></TextInput>
                  </div>

                  <div className="w-2/12 flex items-center">
                  <button type="button" className="btn btn-accent btn-circle" 
                  onClick={() => onRemoveProduct(product.id)}>
                    <span><BiTrash className="w-6 h-6"></BiTrash></span>
                  </button>
                  </div>
                </div>
              </div>
              <div className="divider"></div>
            </div>)})}

            <div className="flex items-center my-5">
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

            <div className="flex justify-between mt-1">
              <button type="button" className="btn btn-alt w-[49%]" onClick={onPreviousPage}>
                <span><BiLeftArrowAlt className="w-7 h-7 mr-1"></BiLeftArrowAlt></span>
                <span>Go back</span>
              </button>
              <button type="submit" className="btn btn-primary w-[49%]">
                <span>{edit ? "Update" : "Create"}</span>
              </button>
            </div>            
          </>) : null}
        </>)}
        <button type="button" className="btn btn-accent w-full mt-3" onClick={onClearForm}>
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