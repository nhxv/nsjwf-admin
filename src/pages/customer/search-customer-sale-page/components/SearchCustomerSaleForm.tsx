import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertTime } from "../../../../commons/utils/time.util";
import DateInput from "../../../../components/forms/DateInput";
import SearchInput from "../../../../components/forms/SearchInput";
import api from "../../../../stores/api";
import CustomerSaleList from "./CustomerSaleList";

export default function SearchCustomerSaleForm() {
  const [search, setSearch] = useState({
    greet: "Your search result will appear here.",
    error: "",
    empty: "",
    loading: false,
    found: [],
  });

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
        greet: "",
        loading: true,
      }));
      try {
        const res = await api.get(
          `/customer-orders/sold/search?keyword=${encodeURIComponent(
            data.keyword
          )}&date=${data.date}`
        );
        if (res.data.length < 1) {
          setSearch((prev) => ({
            ...prev,
            greet: "",
            error: "",
            empty: "No result found.",
            loading: false,
          }));
        } else {
          setSearch((prev) => ({
            ...prev,
            loading: false,
            error: "",
            greet: "",
            empty: "",
            found: res.data,
          }));
        }
      } catch (e) {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setSearch((prev) => ({
          ...prev,
          found: [],
          greet: "",
          error: error.message,
          empty: "",
          loading: false,
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

  const forceReload = () => {
    searchForm.submitForm();
  };

  return (
    <>
      <form
        onSubmit={searchForm.handleSubmit}
        className="custom-card mb-8 w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12"
      >
        <div className="mb-6 flex flex-col">
          <div className="mb-4">
            <DateInput
              id="date"
              min="2022-01-01"
              max="2100-12-31"
              placeholder="Date"
              name="date"
              value={searchForm.values[`date`]}
              onChange={(e) => searchForm.setFieldValue("date", e.target.value)}
            ></DateInput>
          </div>
          <div>
            <SearchInput
              id="search"
              placeholder="Customer's name"
              name="keyword"
              value={searchForm.values.keyword}
              onChange={searchForm.handleChange}
              onFocus={null}
              onClear={() => searchForm.setFieldValue("keyword", "")}
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="btn-accent btn w-full"
            disabled={search.loading}
          >
            Search
          </button>
        </div>
      </form>
      <CustomerSaleList
        search={search}
        reload={forceReload}
        clear={onClearAll}
      ></CustomerSaleList>
    </>
  );
}
