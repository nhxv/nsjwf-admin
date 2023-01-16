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
import { BiRightArrowAlt, BiLeftArrowAlt, BiX } from "react-icons/bi";
import SearchInput from "../../../../components/forms/SearchInput";

export default function VendorOrderForm({
  edit,
  initialData, 
  vendors,
  editedProducts,
  allProducts,
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
    updatePrice(+e.target.value, inputId);
  }

  const onClearForm = () => {
    onClear();
  }

  const onNextPage = async () => {
    if (!edit) {
      setFormState(prev => ({...prev, error: "", empty: "", loading: true}));
      const template = await loadTemplate(vendorOrderForm.values[`vendorName`]);
      if (template) {
        const selected = [];
        for (const product of template) {
          const found = allProducts.find(p => p.name === product.name);
          selected.push({id: found.id, name: product.name});
          vendorOrderForm.setFieldValue(`quantity${found.id}`, product.quantity);
          updatePrice(product.quantity, `quantity${found.id}`);
          vendorOrderForm.setFieldValue(`price${found.id}`, 0);
        }
        setSelectedProducts(selected);
      }
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
      vendorOrderForm.setFieldValue(`quantity${product.id}`, 0);
      vendorOrderForm.setFieldValue(`price${product.id}`, 0);
      setSearchedProducts([]);
      setQuery("");
    }
  }

  const onRemoveProduct = (id) => {
    setSearchedProducts([]);
    setQuery("");
    vendorOrderForm.setFieldValue(`quantity${id}`, 0);
    vendorOrderForm.setFieldValue(`price${id}`, 0);
    updatePrice(0, `remove${id}`);
    setSelectedProducts(selectedProducts.filter(product => product.id !== id));
  }

  const onClearQuery = () => {
    setSearchedProducts([]);
    setQuery("");
  }  

  return (
    <>
      <form onSubmit={vendorOrderForm.handleSubmit}>
        {formState.page === 0 ? (
        <>
          {/* 1st Page */}
          <div className="mb-5">
            <label className="custom-label inline-block mb-2">
              <span>Order to vendor</span>
              <span className="text-red-500">*</span>
            </label>
            <SelectSearch name="vendor" form={vendorOrderForm} field={"vendorName"} 
            options={vendors.map(vendor => vendor.name)}
            value={vendorOrderForm.values["vendorName"]}
            ></SelectSearch>
          </div>

          <div className="mb-5">
            <label htmlFor="expect" className="custom-label block mb-2">Expected delivery date</label>
            <DateInput id="expect" min="2022-01-01" max="2100-12-31"
            name="expect" placeholder="Expected Delivery Date" 
            value={vendorOrderForm.values[`expectedAt`]}
            onChange={(e) => vendorOrderForm.setFieldValue("expectedAt", e.target.value)}
            ></DateInput>
          </div>

          <div className="mb-5">
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

          {vendorOrderForm.values[`vendorName`] ? (
          <button type="button" className="btn btn-primary w-full my-3" onClick={onNextPage}>
            <span>Set product</span>
            <span><BiRightArrowAlt className="w-7 h-7 ml-1"></BiRightArrowAlt></span>
          </button>
          ) : null}
        </>) : (
        <>
          {/* 2nd Page */}
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
              <div className="flex justify-between items-center mb-2">
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
            <div className="flex justify-center mt-5 mb-2">
              <span>Empty.</span>
            </div>)}

            {selectedProducts.map((product) => {
            return (
            <div key={product.id}>
              <div className="flex justify-between items-center">
                <div className="w-5/12">
                  <span>{product.name}</span>
                </div>
                <div className="flex w-7/12">
                  <div className="w-5/12 mr-2">
                    <NumberInput id={`quantity${product.id}`} 
                      name={`quantity${product.id}`} placeholder="Qty" 
                      value={vendorOrderForm.values[`quantity${product.id}`]}
                      onChange={(e) => handlePriceChange(e, `quantity${product.id}`)}
                      min="0" max="99999" disabled={false}
                    ></NumberInput>
                  </div>

                  <div className="w-5/12 mr-2">
                    <TextInput id={`price${product.id}`} type="text" 
                      name={`price${product.id}`} placeholder="Price" 
                      value={vendorOrderForm.values[`price${product.id}`]}
                      onChange={(e) => handlePriceChange(e, `price${product.id}`)}
                    ></TextInput>
                  </div>

                  <div className="w-2/12 flex items-center">
                  <button type="button" className="btn btn-accent btn-circle btn-sm" 
                  onClick={() => onRemoveProduct(product.id)}>
                    <span><BiX className="w-6 h-6"></BiX></span>
                  </button>
                  </div>
                </div>
              </div>
              <div className="divider my-1"></div>
            </div>)})}

            <div className="flex items-center my-5">
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
                        
            <div className="flex justify-between my-3">
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
        <button type="button" className="btn btn-accent w-full" 
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