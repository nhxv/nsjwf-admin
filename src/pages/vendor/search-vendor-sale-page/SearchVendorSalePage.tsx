import { useFormik } from "formik";
import { useState } from "react";
import { BiTrash } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { convertTime } from "../../../commons/utils/time.util";
import DateInput from "../../../components/forms/DateInput";
import SearchInput from "../../../components/forms/SearchInput";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";

export default function SearchVendorSalePage() {
  const [search, setSearch] = useState({
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
      setSearch((prev) => ({
        ...prev,
        found: [],
        error: "",
        empty: "",
        loading: true,
      }));
      try {
        const res = await api.get(
          `/vendor-orders/sold/search?keyword=${encodeURIComponent(
            data.keyword
          )}&date=${data.date}`
        );
        const resData = res.data;
        if (resData.length < 1) {
          setSearch((prev) => ({
            ...prev,
            greet: "",
            error: "",
            empty: "No result found.",
            loading: false,
            found: [],
          }));
        } else {
          setSearch((prev) => ({
            ...prev,
            greet: "",
            error: "",
            empty: "",
            loading: false,
            found: resData,
          }));
        }
      } catch (e) {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setSearch((prev) => ({
          ...prev,
          greet: "",
          empty: "",
          error: error.message,
          loading: false,
          found: [],
        }));
        searchForm.resetForm();
      }
    },
  });

  const onClearAll = () => {
    setSearch((prev) => ({
      ...prev,
      greet: "Your search result will appear here.",
      error: "",
      empty: "",
      loading: false,
      found: [],
    }));
    searchForm.resetForm();
  };

  const onCreateReturn = (code: string) => {
    navigate(`/vendor/create-vendor-return/${code}`);
  };

  return (
    <>
      <section className="min-h-screen">
        <h1 className="my-4 text-center text-xl font-bold">Search sale</h1>
        <div className="mb-8 flex flex-col items-center">
          <form
            onSubmit={searchForm.handleSubmit}
            className="custom-card w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12"
          >
            <div className="mb-6 flex flex-col">
              <div className="mb-4">
                <DateInput
                  id="date"
                  min="2022-01-01"
                  max="2100-12-31"
                  name="date"
                  placeholder="Date"
                  value={searchForm.values[`date`]}
                  onChange={(e) =>
                    searchForm.setFieldValue("date", e.target.value)
                  }
                ></DateInput>
              </div>
              <div className="">
                <SearchInput
                  id="search"
                  name="keyword"
                  placeholder="Vendor's name"
                  value={searchForm.values.keyword}
                  onChange={searchForm.handleChange}
                  onFocus={null}
                  onClear={() => searchForm.setFieldValue("keyword", "")}
                />
              </div>
            </div>
            <div>
              <button type="submit" className="btn-accent btn w-full">
                Search
              </button>
            </div>
          </form>
        </div>
        <div className="flex flex-col items-center">
          {search.loading ? (
            <Spinner></Spinner>
          ) : (
            <>
              {search.found && search.found.length > 0 ? (
                <>
                  {search.found.map((sale) => {
                    return (
                      <div
                        key={sale.code}
                        className="custom-card mb-4 w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12"
                      >
                        {/* basic sale info */}
                        <div className="flex flex-row justify-between">
                          <div>
                            <div>
                              <span>#{sale.code}</span>
                            </div>
                            <div>
                              <span className="text-xl font-semibold">
                                {sale.vendorName}
                              </span>
                            </div>
                            <div className="">
                              <span className="text-sm text-neutral">
                                Completed at{" "}
                                {convertTime(new Date(sale.updatedAt))}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="divider"></div>
                        {/* products in sale */}
                        <div className="mb-2 flex items-center">
                          <div className="w-6/12">
                            <span className="font-medium">Product</span>
                          </div>
                          <div className="w-3/12 text-center">
                            <span className="font-medium">Qty</span>
                          </div>
                          <div className="w-3/12 text-center">
                            <span className="font-medium">Price</span>
                          </div>
                        </div>
                        {sale.productVendorOrders.map((productOrder) => {
                          return (
                            <div
                              key={productOrder.productName}
                              className="rounded-btn mb-2 flex items-center justify-center bg-base-200 py-3 dark:bg-base-300"
                            >
                              <div className="ml-3 w-6/12">
                                <span>{productOrder.productName}</span>
                              </div>
                              <div className="w-3/12 text-center">
                                <span>
                                  {productOrder.quantity} (
                                  {productOrder.unitCode})
                                </span>
                              </div>
                              <div className="w-3/12 text-center">
                                <span>${productOrder.unitPrice}</span>
                              </div>
                            </div>
                          );
                        })}
                        <div className="divider"></div>
                        <div className="my-2 flex items-center gap-2">
                          <span>Total:</span>
                          <span className="text-xl font-medium">
                            $
                            {sale.productVendorOrders.reduce(
                              (prev, curr) =>
                                prev + curr.quantity * curr.unitPrice,
                              0
                            )}
                          </span>
                        </div>
                        {!sale.fullReturn ? (
                          <button
                            className="btn-primary btn mt-3 w-full"
                            onClick={() => onCreateReturn(sale.code)}
                          >
                            Create return
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                  <div className="mt-4 mb-8">
                    <button className="btn-accent btn" onClick={onClearAll}>
                      <span className="mr-2">Clear search result(s)</span>
                      <BiTrash className="h-6 w-6"></BiTrash>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {search.error ? (
                    <p className=" text-neutral">{search.error}</p>
                  ) : (
                    <>
                      {search.empty ? (
                        <p className="text-neutral">{search.empty}</p>
                      ) : (
                        <>
                          {search.greet ? (
                            <p className="text-neutral">{search.greet}</p>
                          ) : null}
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
