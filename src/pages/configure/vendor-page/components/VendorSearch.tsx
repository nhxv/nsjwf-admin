import { useState } from "react";
import { useFormik } from "formik";
import api from "../../../../stores/api";
import SearchInput from "../../../../components/forms/SearchInput";
import Spinner from "../../../../components/Spinner";
import { BiSearch, BiTrash, BiEdit } from "react-icons/bi";
import { useVendorConfigStore } from "../../../../stores/vendor-config.store";
import { VendorResponse } from "../../../../models/vendor-response.model";

export default function VendorSearch() {
  const [searchState, setSearchState] = useState({
    greet: "Your search result will appear here.",
    error: "",
    empty: "",
    loading: false,
    found: [],
  });
  const editVendorConfig = useVendorConfigStore((state) => state.editVendorConfig);

  const searchForm = useFormik({
    initialValues: {
      keyword: ""
    },
    onSubmit: async (data) => {
      setSearchState(prev => ({...prev, found: [], loading: true}));
      try {
        const res = await api.get(`/vendors/basic-search?keyword=${data.keyword}`);
        const resData: VendorResponse[] = res.data;
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

  const onEdit = (vendor) => {
    editVendorConfig(vendor);
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
          <SearchInput id="vendor-search" name="keyword" placeholder="Search by vendor's name" 
          value={searchForm.values.keyword} onChange={searchForm.handleChange} />
          <button type="submit" className="btn btn-accent border-2 ml-2">
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
              {searchState.found.map((vendor) => (
              <div key={vendor.id} className="w-full">
                <div className="flex flex-col md:flex-row md:justify-between 
                p-6 bg-white rounded-box shadow-md mb-4 w-full">
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                    <small className="text-sm text-gray-400">Address:</small>
                    <p>{vendor.address ? vendor.address : "Unknown"}</p>
                    <small className="text-sm text-gray-400">Phone:</small>
                    <p>{vendor.phone ? vendor.phone : "Unknown"}</p>
                    <small className="text-sm text-gray-400">Email:</small>
                    <p>{vendor.email ? vendor.email : "Unknown"}</p>
                    <small className="text-sm text-gray-400">Presentative:</small>
                    <p>{vendor.presentative ? vendor.presentative : "Unknown"}</p>
                    <small className="text-sm text-gray-400">Status:</small>
                    <p>{vendor.discontinued ? "Discontinued" : "In use"}</p>
                  </div>

                  <button className="btn btn-success text-emerald-600 w-full md:w-fit mt-4 md:mt-0"
                  onClick={() => onEdit(vendor)}>
                    <BiEdit className="w-6 h-6"></BiEdit>
                  </button>
                </div>
              </div>
              ))}
              <div className="mt-4">
                <button className="btn btn-accent" onClick={onClearAll}>
                  <span className="mr-2">Clear search result(s)</span>
                  <BiTrash className="w-6 h-6"></BiTrash>
                </button>
              </div>
            </>
            ) : (
            <>
            {searchState.error ? (
            <>
              <p className=" text-gray-500">{searchState.error}</p>
            </>
            ) : (
            <> 
              {searchState.empty ? (
                <>
                  <p className=" text-gray-500">{searchState.empty}</p>
                </>
              ) : (
              <>
                {searchState.greet ? (
                <>
                  <p className=" text-gray-500">{searchState.greet}</p>
                </>
                ) : (<></>)}
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