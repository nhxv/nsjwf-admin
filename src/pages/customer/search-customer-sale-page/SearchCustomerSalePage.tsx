import { useFormik } from "formik";
import api from "../../../stores/api";
import Spinner from "../../../components/Spinner";
import SearchInput from "../../../components/forms/SearchInput";
import DateInput from "../../../components/forms/DateInput";
import { useState } from "react";
import { convertTime } from "../../../commons/time.util";
import { BiTrash } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

export default function SearchCustomerSalePage() {
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
      keyword: "",
      date: convertTime(new Date()),
    },
    onSubmit: async (data) => {
      setSearchState(prev => ({...prev, found: [], loading: true}));
      try {
        const res = await api.get(
          `/customer-orders/sold/search?keyword=${data.keyword}&date=${data.date}`
        );
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

  const onCreateReturn = (code: string) => {
    navigate(`/customer/create-customer-return/${code}`);
  }

  return (
  <>
    <section className="min-h-screen">
      <h1 className="text-center font-bold text-xl my-4">Search sale</h1>
      <div className="flex flex-col items-center mb-8">
        <form onSubmit={searchForm.handleSubmit} className="w-11/12 sm:w-8/12 md:w-6/12 bg-white p-6 rounded-box shadow-md">
          <div className="flex flex-col mb-6">
            <div className="mb-4">
              <DateInput id="date" min="2022-01-01" max="2100-12-31"
              name="date" placeholder="Date" 
              value={searchForm.values[`date`]}
              onChange={(e) => searchForm.setFieldValue("date", e.target.value)}
              ></DateInput>              
            </div>
            <div className="">
              <SearchInput id="search" name="keyword" placeholder="Customer's name" 
              value={searchForm.values.keyword} onChange={searchForm.handleChange} />              
            </div>
          </div>
          <div>
            <button type="submit" className="btn btn-accent text-black w-full">Search</button>
          </div>
        </form>
      </div>
      <div className="flex flex-col items-center">
        {searchState.loading ? (
          <>
            <Spinner></Spinner>
          </>
        ) : (
        <>
          {searchState.found && searchState.found.length > 0 ? (
          <>
            {searchState.found.map((sale) => {
            return (
              <div key={sale.code} className="w-11/12 sm:w-8/12 md:w-6/12 bg-white p-6 rounded-box shadow-md mb-4">
                {/* basic sale info */}
                <div className="flex flex-row justify-between">
                  <div>
                    <div>
                      <span>#{sale.code}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-xl">{sale.customerName}</span>
                    </div>  
                    <div className="">
                      <span className="text-gray-400 text-sm">Completed at {convertTime(new Date(sale.updatedAt))}</span>
                    </div>                  
                  </div>
                </div>
                <div className="divider"></div>
                {/* products in sale */}
                <div className="flex items-center mb-2">
                  <div className="w-6/12">
                    <span className="font-medium">Product</span>
                  </div>
                  <div className="w-3/12 text-center">
                    <span className="font-medium">Qty</span>
                  </div>
                  <div className="w-3/12 text-center">
                    <span className="font-medium">Unit price</span>
                  </div>
                </div>
                {sale.productCustomerOrders.map(productOrder => {
                  return (
                  <div key={productOrder.productName} className="flex justify-center items-center py-3 bg-gray-100 rounded-btn mb-2">
                    <div className="w-6/12 ml-2">
                      <span>{productOrder.productName}</span>
                    </div>
                    <div className="w-3/12 text-center">
                      <span>{productOrder.quantity}</span>
                    </div>
                    <div className="w-3/12 text-center">
                      <span>{productOrder.unitPrice}</span>
                    </div>
                  </div>
                  )
                })}
                {!sale.fullReturn ? (
                <>
                  <div className="divider"></div>
                  <button className="btn btn-primary text-white w-full mt-2" 
                  onClick={() => onCreateReturn(sale.code)}>Create return</button> 
                </>) : (<></>)}                
              </div>)              
            })}
            <div className="mt-4 mb-8">
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
        )}
      </div>
    </section>  
  </>
  );
}