import { useState } from "react";
import { useFormik } from "formik";
import { ProductResponse } from "../../../../models/product-response.model";
import api from "../../../../stores/api";
import SearchInput from "../../../../components/forms/SearchInput";
import Spinner from "../../../../components/Spinner";
import { BiSearch, BiTrash, BiEdit } from "react-icons/bi";
import { useProductConfigStore } from "../../../../stores/product-config.store";

export default function ProductSearch() {
  const [searchState, setSearchState] = useState({
    greet: "Your search result will appear here.",
    error: "",
    empty: "",
    loading: false,
    found: [],
  });
  const editProductConfig = useProductConfigStore((state) => state.editProductConfig);

  const searchForm = useFormik({
    initialValues: {
      keyword: ""
    },
    onSubmit: async (data) => {
      setSearchState(prev => ({...prev, found: [], loading: true}));
      try {
        const res = await api.get(`/products/basic-search?keyword=${data.keyword}`);
        const resData: ProductResponse[] = res.data;
        if (resData.length < 1) {
          setSearchState(prev => ({...prev, greet: "", empty: "No result found.", loading: false}));
        }
        setSearchState(prev => ({...prev, loading: false, found: resData}));
      } catch (e) {
        const error = JSON.parse(JSON.stringify(
          e.response ? e.response.data.error : e
        ));
        setSearchState(prev => ({...prev, greet: "", error: error.message, loading: false}));
        searchForm.resetForm();
      }
    }
  });

  const onEdit = (product) => {
    editProductConfig(product);
    setSearchState(prev => ({...prev, found: []}));
    searchForm.resetForm();
  }

  const onClearAll = () => {
    setSearchState(prev => ({
      ...prev, 
      greet: "Your search result will appear here.", 
      error: "", 
      empty: "",
      loading: false,
      found: [],
    }));
    searchForm.resetForm();
  }

  return (
  <>
    <div className="w-11/12 sm:w-6/12 md:w-5/12 mt-12">
      <form onSubmit={searchForm.handleSubmit} className="flex flex-col justify-center">
        <div className="mb-5 flex">
          <SearchInput id="product-search" name="keyword" placeholder="Search by product's name" 
          value={searchForm.values.keyword} onChange={searchForm.handleChange}
          onClear={() => searchForm.setFieldValue("keyword", "")} />
          <button type="submit" className="btn btn-accent btn-circle ml-2">
            <BiSearch className="w-6 h-6"></BiSearch>
          </button>
        </div>
      </form>
    </div>
    <div className="w-11/12 sm:w-6/12 md:w-5/12 mb-8">
      <div className="flex flex-col justify-center items-center">
        {searchState.loading ? (
          <>
            <Spinner></Spinner>
          </>
        ) : (
        <>
          {searchState.found && searchState.found.length > 0 ? (
          <>
            {searchState.found.map((product) => (
            <div key={product.id} className="w-full">
              <div className="flex flex-col md:flex-row md:justify-between 
              p-6 bg-base-100 rounded-box shadow-md mb-4 w-full">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-neutral">{product.discontinued ? "Discontinued" : "In use"}</p>
                </div>

                <button className="btn btn-info text-primary w-full md:w-fit mt-4 md:mt-0"
                onClick={() => onEdit(product)}>
                  <BiEdit className="w-6 h-6"></BiEdit>
                </button>
              </div>
            </div>
            ))}
            <div className="flex justify-center items-center mt-4">
              <button className="btn btn-accent" onClick={onClearAll}>
                <span className="mr-2">Clear search result(s)</span>
                <BiTrash className="w-6 h-6"></BiTrash>
              </button>
            </div>
          </>
          ) : (
            <>
              {searchState.error ? (
              <p className="text-neutral">{searchState.error}</p>
              ) : (
              <> 
                {searchState.empty ? (
                <p className="text-neutral">{searchState.empty}</p>
                ) : (
                <>
                  {searchState.greet ? (
                  <p className="text-neutral">{searchState.greet}</p>
                  ) : null}
                </>
                )}
              </>
              )}  
          </>
          )}        
        </>
        )
        }
      </div>
    </div>  
  </>
  )
}