import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertTime } from "../../../../commons/utils/time.util";
import DateInput from "../../../../components/forms/DateInput";
import api from "../../../../stores/api";
import CustomerSaleList from "./CustomerSaleList";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import TextInput from "../../../../components/forms/TextInput";
import SelectSearch from "../../../../components/forms/SelectSearch";

export default function SearchCustomerSaleForm({ customers, products }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    greet: "Your search result will appear here.",
    error: "",
    empty: "",
    loading: false,
    found: [],
    matchCustomers: [],
    matchProducts: [],
    queryCustomer: "",
    queryProduct: "",
  });

  const searchForm = useFormik({
    initialValues: {
      manualCode: "",
      customer: "",
      product: "",
      date: "",
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
      let url = "";
      if (data.manualCode) {
        url += `code=${encodeURIComponent(data.manualCode)}&`;
      }
      if (data.date) {
        url += `date=${data.date}&`;
      }
      if (Object.keys(data.customer).length !== 0) {
        url += `customer=${encodeURIComponent(data.customer)}&`;
      }
      if (Object.keys(data.product).length !== 0) {
        url += `product=${encodeURIComponent(data.product)}&`;
      }
      try {
        const res = await api.get(`/customer-orders/sold/search?${url}`);
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

        if (error.status === 401) {
          handleTokenExpire(navigate, setSearch);
        } else {
          searchForm.resetForm();
        }
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
      matchCustomers: [],
      matchProducts: [],
      queryCustomer: "",
      queryProduct: "",
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
        className="custom-card mb-8 w-11/12 md:w-8/12 lg:w-6/12"
      >
        <div className="mb-6 flex flex-col gap-4 xl:grid xl:grid-cols-2">
          <div>
            <label className="custom-label mb-2 inline-block">Code</label>
            <TextInput
              id="by-code"
              placeholder="Code"
              name="by-code"
              value={searchForm.values.manualCode}
              onChange={(e) =>
                searchForm.setFieldValue("manualCode", e.target.value)
              }
            />
          </div>
          <div>
            <label className="custom-label mb-2 inline-block">
              Completed on
            </label>
            <DateInput
              id="date"
              min="2022-01-01"
              max="2100-12-31"
              placeholder="Date"
              name="date"
              value={searchForm.values.date}
              onChange={searchForm.handleChange}
            ></DateInput>
          </div>
          <div>
            <label className="custom-label mb-2 inline-block">Customer</label>
            <SelectSearch
              name="customer-select"
              value={searchForm.values.customer}
              setValue={(customer) => {
                // This can be null, and we don't want that.
                searchForm.setFieldValue("customer", customer ? customer : "");
              }}
              options={customers.map((c) => c.name)}
              nullable={true}
            />
          </div>

          <div>
            <label className="custom-label mb-2 inline-block">Product</label>
            <SelectSearch
              name="product-select"
              value={searchForm.values.product}
              setValue={(product) => {
                // This can be null, and we don't want that.
                searchForm.setFieldValue("product", product ? product : "");
              }}
              options={products.map((p) => p.name)}
              nullable={true}
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="btn btn-accent w-full"
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
