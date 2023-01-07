import TextInput from "../../../../components/forms/TextInput"
import Spinner from "../../../../components/Spinner";
import Alert from "../../../../components/Alert";
import Checkbox from "../../../../components/forms/Checkbox";
import { useFormik } from "formik";
import { useState } from "react";
import { BiLeftArrowAlt, BiRightArrowAlt, BiTrash } from "react-icons/bi";
import SearchInput from "../../../../components/forms/SearchInput";
import NumberInput from "../../../../components/forms/NumberInput";
import api from "../../../../stores/api";

export default function DraftVendorForm({editedId, editedProducts, initialData, allProducts, onClear}) {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
    page: 0,
  });
  const [query, setQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState(editedProducts ? editedProducts : []);
  const [searchedProducts, setSearchedProducts] = useState([]);

  const vendorForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      setFormState(prev => ({...prev, loading: true, error: "", success: ""}));
      const reqData = {};
      reqData["name"] = data["name"];
      reqData["address"] = data["address"];
      reqData["phone"] = data["phone"];
      reqData["email"] = data["email"];
      reqData["presentative"] = data["presentative"];
      reqData["discontinued"] = data["discontinued"];
      const productTendencies = [];
      for (const property in data) {
        if (property.includes("quantity")) {
          const id = +property.replace("quantity", "");
          const product = allProducts.find(p => p.id === id);
          const selected = selectedProducts.find(p => p.name === product.name);
          if (selected) {
            productTendencies.push({
              vendorName: data["name"],
              productName: selected.name,
              quantity: data[property],
            });
          }
        }
      }
      reqData["vendorProductTendencies"] = productTendencies;
      try {
        let res = null;
        if (editedId) {
          res = await api.put(`/vendors/${editedId}`, reqData);
        } else {
          res = await api.post(`/vendors`, reqData);
        }
        if (res) {
          setFormState(prev => ({...
            prev, 
            error: "", 
            loading: false, 
            success: "Create vendor successfully."
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

  const onNextPage = () => {
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
      vendorForm.setFieldValue(`quantity${product.id}`, 0);
      setSearchedProducts([]);
      setQuery("");
    }
  }

  const onRemoveProduct = (id) => {
    setSearchedProducts([]);
    setQuery("");
    vendorForm.setFieldValue(`quantity${id}`, 0);
    setSelectedProducts(selectedProducts.filter(product => product.id !== id));
  }

  const handleQuantityChange = (product, e) => {
    if (e.target.value) {
      vendorForm.setFieldValue(`quantity${product.id}`, e.target.value);
    } else {
      vendorForm.setFieldValue(`quantity${product.id}`, "");
    }
  }

  const onClearQuery = () => {
    setSearchedProducts([]);
    setQuery("");
  }

  return (
    <>
      <form onSubmit={vendorForm.handleSubmit}>
        {formState.page === 0 ? ( 
        <>
          {/* 1st Page */} 
          <div className="mb-5">
            <label htmlFor="name" className="custom-label inline-block mb-2">
              <span>Name</span>
              <span className="text-red-500">*</span>
            </label>
            <TextInput id="name" type="text" name="name" placeholder={`Name`} 
            value={vendorForm.values.name} 
            onChange={vendorForm.handleChange}
            ></TextInput>
          </div>
    
          <div className="mb-5">
            <label htmlFor="address" className="custom-label inline-block mb-2">Address</label>
            <TextInput id="address" type="text" name="address" placeholder={`Address`} 
            value={vendorForm.values.address} 
            onChange={vendorForm.handleChange}
            ></TextInput>
          </div>
    
          <div className="mb-5">
            <label htmlFor="phone" className="custom-label inline-block mb-2">Phone</label>
            <TextInput id="phone" type="text" name="phone" placeholder={`Phone`} 
            value={vendorForm.values.phone} 
            onChange={vendorForm.handleChange}
            ></TextInput>
          </div>
    
          <div className="mb-5">
            <label htmlFor="email" className="custom-label inline-block mb-2">Email</label>
            <TextInput id="email" type="email" name="email" placeholder={`Email`} 
            value={vendorForm.values.email} 
            onChange={vendorForm.handleChange}
            ></TextInput>
          </div>
    
          <div className="mb-5">
            <label htmlFor="presentative" className="custom-label inline-block mb-2">Presentative</label>
            <TextInput id="presentative" type="presentative" name="presentative" placeholder={`Presentative`} 
            value={vendorForm.values.presentative} 
            onChange={vendorForm.handleChange}
            ></TextInput>
          </div>
          
          <div className="mb-5 flex items-center">
            <Checkbox id="discontinued" name="discontinued"
            onChange={() => vendorForm.setFieldValue("discontinued", !vendorForm.values.discontinued)} 
            checked={!vendorForm.values.discontinued}
            label="In use" 
            ></Checkbox>
          </div>
          <button type="button" className="mt-1 btn btn-primary w-full" onClick={onNextPage}>
            <span>Product template</span>
            <span><BiRightArrowAlt className="w-7 h-7 ml-1"></BiRightArrowAlt></span>
          </button>       
        </>
        ) : (
        <>
          {formState.page === 1 ? (
          <>
            {/* 2nd Page */}
            {allProducts?.length > 0 ? ( 
            <div className="mb-5">
              <div className="flex justify-between items-center">
                <div className="w-full">
                  <SearchInput id="product-search" name="product-search" placeholder="Search product"
                  onChange={(e) => onChangeSearch(e)} value={query} onFocus={() => setSearchedProducts(allProducts)}
                  onClear={onClearQuery}></SearchInput>
                </div>
              </div>
              {searchedProducts.map((product, index) => (
              <div key={index} className="cursor-pointer my-2 w-full bg-base-200 p-3 rounded-btn 
              hover:bg-primary hover:text-primary-content focus:bg-primary focus:text-primary-content" 
              onClick={() => onAddProduct(product)}>
                <p>{product.name}</p>
              </div>
              ))}
              {searchedProducts?.length === 0 && query ? (
              <div className="my-2 w-full bg-base-200 p-3 rounded-btn">
                <p>Not found.</p>
              </div>) : null}
            </div>            
            ) : null}
            <div className="mb-5">
              {selectedProducts && selectedProducts.length > 0 ? (
              <>
                <div className="flex justify-between items-center mt-8 mb-4">
                  <div className="w-5/12">
                    <span className="custom-label">Product</span>
                  </div>
                  <div className="flex w-7/12">
                    <div className="w-6/12 mr-2">
                      <span className="custom-label">Qty</span>
                    </div>
                  </div>
                </div>
                {selectedProducts.map((product) => 
                <div key={product.id}>
                <div className="flex justify-between items-center mb-4">
                  <div className="w-5/12">
                    <span>{product.name}</span>
                  </div>
                  <div className="flex w-7/12">
                    <div className="w-6/12 mr-2">
                      <NumberInput id={`quantity${product.id}`} 
                        name={`quantity${product.id}`} placeholder="Qty" 
                        value={vendorForm.values[`quantity${product.id}`]}
                        onChange={(e) => handleQuantityChange(product, e)}
                        min="0" max="99999" disabled={false}
                      ></NumberInput>
                    </div>
                    <div className="w-6/12">
                      <button type="button" className="btn btn-accent w-full" 
                      onClick={() => onRemoveProduct(product.id)}>
                        <span><BiTrash className="w-6 h-6 lg:mr-1"></BiTrash></span>
                        <span className="hidden lg:block">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="divider"></div>
              </div>
                )}
              </>) : (
              <div className="flex justify-center">
                <span>Empty template.</span>
              </div>)}
            </div>
            <div className="flex justify-between mt-1">
              <button type="button" className="btn btn-alt w-[49%]" onClick={onPreviousPage}>
                <span><BiLeftArrowAlt className="w-7 h-7 mr-1"></BiLeftArrowAlt></span>
                <span>Go back</span>
              </button>
              <button type="submit" className="btn btn-primary w-[49%]">
                <span>{editedId ? "Update" : "Create"}</span>
              </button>
            </div>
          </>
          ) : null}
        </>)}
        <button type="button" className="mt-3 btn btn-accent w-full" onClick={onClear}>
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