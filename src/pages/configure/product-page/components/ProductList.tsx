import { useState, useEffect } from "react";
import Spinner from "../../../../components/Spinner";
import Alert from "../../../../components/Alert";
import SearchInput from "../../../../components/forms/SearchInput";
import { BiEdit, BiPlus } from "react-icons/bi";
import ProductForm from "./ProductForm";
import { FormType } from "../../../../commons/form-type.enum";
import api from "../../../../stores/api";

export default function ProductList() {
  const [fetchData, setFetchData] = useState({
    products: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [modal, setModal] = useState({
    product: {
      id: -1,
      name: "",
      discontinued: false,
    },
    type: FormType.CREATE,
    isOpen: false,
  });
  const [reload, setReload] = useState(false);
  const [search, setSearch] = useState({
    products: [],
    query: "",
  });

  useEffect(() => {
    api.get(`/products/all`)
    .then(res => {
      if (res.data?.length === 0) {
        setFetchData(prev => (
          {...prev, error: "", empty: "Such hollow, much empty...", loading: false}
        ));
      } else {
        setSearch(prev => ({...prev, products: res.data}));
        setFetchData(prev => ({...prev, products: res.data, error: "", loading: false}));
      }

    })
    .catch(e => {
      const error = JSON.parse(JSON.stringify(
        e.response ? e.response.data.error : e
      ));
      setFetchData(prev => ({...prev, error: error.message, empty: "", loading: false}));
    });
  }, [reload]);

  const onAdd = () => {
    setModal(prev => ({
      ...prev, 
      product: {
        ...prev.product,
        id: -1,
        name: "",
        discontinued: false,
      },
      type: FormType.CREATE,
      isOpen: true,
    }));
  }

  const onEdit = (data) => {
    setModal(prev => ({
      ...prev,
      product: {
        ...prev.product,
        id: data.id, 
        name: data.name, 
        discontinued: data.discontinued,
      }, 
      type: FormType.EDIT,
      isOpen: true,
    }));
  }

  const onCloseForm = () => {
    setModal(prev => ({...prev, isOpen: false}));
  }

  const onReload = () => {
    setReload(!reload);
  }

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = fetchData.products.filter(product => product.name.toLowerCase().replace(/\s+/g, "").includes(e.target.value.toLowerCase().replace(/\s+/g, "")));
      setSearch(prev => ({
        ...prev, 
        products: searched, 
        query: e.target.value
      }));
    } else {
      setSearch(prev => ({
        ...prev, 
        products: fetchData.products, 
        query: e.target.value
      }));
    }
  }

  const onClearQuery = () => {
    setSearch(prev => ({
      ...prev, 
      products: fetchData.products, 
      query: "",
    }));
  } 

  if (fetchData.loading) {
    return (
      <Spinner></Spinner>
    );
  }

  if (fetchData.error) {
    return (
      <div className="w-11/12 sm:w-8/12 xl:w-6/12 mx-auto">
        <Alert type="error" message={fetchData.error}></Alert>
      </div>
    );
  }

  if (fetchData.empty) {
    return (
      <div className="w-11/12 sm:w-8/12 xl:w-6/12 mx-auto">
        <Alert type="empty" message={fetchData.empty}></Alert>
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
        name="product-search" value={search.query} 
        onChange={(e) => onChangeSearch(e)} 
        onClear={onClearQuery} 
        onFocus={null}
        ></SearchInput>
      </div>
      <div className="grid grid-cols-12 gap-4 px-4">
        {search.products.map((product) => (
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
      {search.products?.length < 1 ? (<div className="text-center">Not found.</div>) : null}
      <ProductForm 
        isOpen={modal.isOpen}
        onClose={onCloseForm} 
        product={modal.product} 
        onReload={onReload}
        type={modal.type}
      ></ProductForm>        
    </>
  );
}