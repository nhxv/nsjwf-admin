import { useState, useEffect } from "react";
import Spinner from "../../../../components/Spinner";
import Alert from "../../../../components/Alert";
import SearchInput from "../../../../components/forms/SearchInput";
import { BiEdit, BiPlus } from "react-icons/bi";
import ProductForm from "./ProductForm";
import { FormType } from "../../../../commons/form-type.enum";
import api from "../../../../stores/api";

export default function ProductList() {
  const [dataState, setDataState] = useState({
    products: null,
    error: "",
    empty: "",
    loading: true,
  });
  const [modalData, setModalData] = useState({
    id: -1,
    name: "",
    discontinued: false,
    formType: FormType.CREATE,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const [query, setQuery] = useState("");
  const [searchedProducts, setSearchedProducts] = useState([]);

  useEffect(() => {
    api.get(`/products/all`)
    .then(res => {
      if (res.data?.length === 0) {
        setDataState(prev => (
          {...prev, error: "", empty: "Such hollow, much empty...", loading: false}
        ));
      } else {
        setSearchedProducts(res.data);
        setDataState(prev => ({...prev, products: res.data, error: "", loading: false}));
      }

    })
    .catch(e => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setDataState(prev => ({...prev, error: error.message, loading: false}));
    });
  }, [reload]);

  const onAdd = () => {
    setModalData(prev => ({
      ...prev, 
      id: -1,
      name: "",
      discontinued: false,
      formType: FormType.CREATE,
    }));
    setIsOpen(true);
  }

  const onEdit = (data) => {
    setModalData(prev => ({
      ...prev, 
      id: data.id, 
      name: data.name, 
      discontinued: data.discontinued,
      formType: FormType.EDIT,
    }));
    setIsOpen(true);
  }

  const onCloseForm = () => {
    setIsOpen(false);
  }

  const onReload = () => {
    setReload(!reload);
  }

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = dataState.products.filter(product => product.name.toLowerCase().replace(/\s+/g, "").includes(e.target.value.toLowerCase().replace(/\s+/g, "")));
      setSearchedProducts(searched);
    } else {
      setSearchedProducts(dataState.products);
    }
    setQuery(e.target.value);
  }

  const onClearQuery = () => {
    setSearchedProducts(dataState.products);
    setQuery("");
  } 

  if (dataState.loading) {
    return (
      <Spinner></Spinner>
    );
  }

  if (dataState.error) {
    return (
      <div className="w-11/12 sm:w-8/12 xl:w-6/12 mx-auto">
        <Alert type="error" message={dataState.error}></Alert>
      </div>
    );
  }

  if (dataState.empty) {
    return (
      <div className="w-11/12 sm:w-8/12 xl:w-6/12 mx-auto">
        <Alert type="empty" message={dataState.empty}></Alert>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-24 right-6 md:right-8 z-20">
        <button className="btn btn-primary btn-circle" onClick={onAdd}>
          <span><BiPlus className="w-8 h-8"></BiPlus></span>
        </button>
      </div>

      <div className="mb-5 w-11/12 sm:w-8/12 xl:w-6/12 mx-auto">
        <SearchInput id="product-search" placeholder="Search product"
        name="product-search" value={query} 
        onChange={(e) => onChangeSearch(e)} 
        onClear={onClearQuery} 
        onFocus={null}
        ></SearchInput>
      </div>
      <div className="grid grid-cols-12 gap-4 px-4">
        {searchedProducts.map((product) => (
          <div key={product.name} className="col-span-12 sm:col-span-6 xl:col-span-3 custom-card flex items-center">
            <button className="btn btn-accent btn-circle mr-4" onClick={() => onEdit(product)}>
              <span><BiEdit className="h-6 w-6"></BiEdit></span>
            </button>
            <div className="flex flex-col">
              <span className="font-medium">{product.name}</span>
              <span className="text-sm text-neutral">{product.discontinued ? "Not available" : "Available"}</span>
            </div>
          </div>
        ))}
      </div>
      {searchedProducts?.length < 1 ? (<div className="text-center">Not found.</div>) : null}
      <ProductForm 
        isOpen={isOpen} 
        onClose={onCloseForm} 
        product={modalData} 
        onReload={onReload}
        type={modalData.formType}
      ></ProductForm>        
    </>
  );
}