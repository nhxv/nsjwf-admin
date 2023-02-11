import { useFormik } from "formik";
import { useState } from "react";
import api from "../../../stores/api";
import SearchInput from "../../../components/forms/SearchInput";
import Spinner from "../../../components/Spinner";
import { BiSearch, BiTrash, BiEdit } from "react-icons/bi";
import { useNavigate } from "react-router";

export default function ViewCustomerPage() {
  const [searchState, setSearchState] = useState({
    greet: "Your search result will appear here.",
    error: "",
    empty: "",
    loading: false,
    found: [],
  });

  const navigate = useNavigate();

  const searchForm = useFormik({
    initialValues: {
      keyword: ""
    },
    onSubmit: async (data) => {
      setSearchState(prev => ({...prev, found: [], loading: true}));
      try {
        const res = await api.get(`/customers/basic-search?keyword=${data.keyword}`);
        const resData = res.data;
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

  const onUpdate = (id: number) => {
    navigate(`/configure/draft-customer/${id}`);
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
    <section className="min-h-screen flex flex-col items-center">
      <h1 className="font-bold text-xl my-4">View customer</h1>
      <div className="w-11/12 sm:w-6/12 md:w-5/12">
        <form onSubmit={searchForm.handleSubmit} className="flex flex-col justify-center">
          <div className="mb-5 flex">
            <SearchInput id="customer-search" name="keyword" placeholder="Search by customer's name"
            value={searchForm.values.keyword} onChange={searchForm.handleChange} onFocus={null}
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
          <Spinner></Spinner>
          ) : (
          <>
            {searchState.found && searchState.found.length > 0 ? (
              <>
                {searchState.found.map((customer) => (
                <div key={customer.id} className="w-full">
                  <div className="custom-card flex justify-between items-center mb-4">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-neutral">{customer.discontinued ? "Discontinued" : "In use"}</p>
                    </div>
  
                    <button className="btn btn-circle btn-accent" onClick={() => onUpdate(customer.id)}>
                      <span><BiEdit className="w-6 h-6"></BiEdit></span>
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
    </section>
  )
}