import { useFormik } from "formik";
import { useState } from "react";
import { BiTrash } from "react-icons/bi";
import { ProductStockChangeReason } from "../../../../commons/product-stock-change-reason.enum";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import NumberInput from "../../../../components/forms/NumberInput";
import SearchSuggest from "../../../../components/forms/SearchSuggest";
import SelectInput from "../../../../components/forms/SelectInput";
import api from "../../../../stores/api";

export default function ProductStockForm({ initialData, stocks, onClear }) {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
  });

  const [query, setQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchedProducts, setSearchedProducts] = useState([]);

  const productStockForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      setFormState(prev => ({...prev, success: "", error: "", loading: true}));
      try {
        const reqData = {};
        const stock = [];
        for (const property in data) {
          if (property.includes("quantity")) {
            const item = {id: -1, quantity: -1};
            item.id = +property.replace("quantity", "");
            const selected = selectedProducts.find(p => p.id === item.id);
            if (selected) {
              item.quantity = data[property];
              stock.push(item);
            }
          }
        }
        reqData["stock"] = stock;
        reqData["reason"] = data["reason"];
        const res = await api.put(`/product-stock`, reqData);
        setFormState(prev => ({
          ...prev, 
          success: "Update stock successfully.", 
          error: "", 
          loading: false
        }));
        setTimeout(() => {
          setFormState(prev => ({...prev, success: ""}));
          onClear();
        }, 2000);
      } catch (e) {
        const error = JSON.parse(JSON.stringify(
          e.response ? e.response.data.error : e
        ));
        setFormState(prev => ({...prev, error: error.message, success: "", loading: false}));
      }
    }
  });

  const onClearForm = () => {
    onClear();
  }

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = stocks.filter(product => product.name.toLowerCase().replace(/\s+/g, "").includes(e.target.value.toLowerCase().replace(/\s+/g, "")));
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
      productStockForm.setFieldValue(`quantity${product.id}`, 0);
      setSearchedProducts([]);
      setQuery("");
    }
  }

  const onRemoveProduct = (id) => {
    setSearchedProducts([]);
    setQuery("");
    productStockForm.setFieldValue(`quantity${id}`, 0);
    setSelectedProducts(selectedProducts.filter(product => product.id !== id));
  }

  const onClearQuery = () => {
    setSearchedProducts([]);
    setQuery("");
  }   

  return (
  <>
    <form onSubmit={productStockForm.handleSubmit}>
      <div className="mb-5">
        <label htmlFor="reason" className="custom-label inline-block mb-2">Reason</label>
        <SelectInput name="reason" form={productStockForm} field={"reason"} 
        options={Object.values(ProductStockChangeReason).filter(reason => 
          reason !== ProductStockChangeReason.CUSTOMER_ORDER_CREATE &&
          reason !== ProductStockChangeReason.CUSTOMER_ORDER_EDIT &&
          reason !== ProductStockChangeReason.CUSTOMER_RETURN_RECEIVED &&
          reason !== ProductStockChangeReason.VENDOR_ORDER_COMPLETED &&
          reason !== ProductStockChangeReason.VENDOR_RETURN_RECEIVED &&
          reason !== ProductStockChangeReason.EMPLOYEE_BORROW
        )}
        value={productStockForm.values["reason"]}
        ></SelectInput>
      </div>

      <div className="mb-5">
        <SearchSuggest query={query} items={searchedProducts}
        onChange={(e) => onChangeSearch(e)} onFocus={() => setSearchedProducts(stocks)}
        onSelect={onAddProduct} onClear={onClearQuery}></SearchSuggest>
      </div>

      {selectedProducts?.length > 0 ? (
      <>
        <div className="flex justify-between items-center mb-2">
          <div className="w-6/12">
            <span className="custom-label">Product</span>
          </div>
          <div className="w-6/12">
            <span className="custom-label">Qty</span>
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
          <div className="w-6/12">
            <span>{product.name}</span>
          </div>
          <div className="flex w-6/12">
            <div className="w-[49%] mr-2">
              <NumberInput id={`quantity${product.id}`} 
                name={`quantity${product.id}`} placeholder="Qty" 
                value={productStockForm.values[`quantity${product.id}`]}
                onChange={productStockForm.handleChange}
                min="0" max="99999" disabled={false}
              ></NumberInput>
            </div>

            <div className="w-[49%] flex items-center">
            <button type="button" className="btn btn-accent w-full" 
            onClick={() => onRemoveProduct(product.id)}>
              <span><BiTrash className="w-6 h-6 mr-1"></BiTrash></span>
              <span className="hidden lg:inline-block">Remove</span>
            </button>
            </div>
          </div>
        </div>
        <div className="divider my-1"></div>
      </div>)})}

      <button type="submit" className="my-3 btn btn-primary w-full">Update Stock</button>
      <button type="button" className="btn btn-accent w-full" onClick={onClearForm}>Clear change(s)</button>

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