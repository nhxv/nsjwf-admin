import { useState, useEffect } from "react";
import api from "../../../stores/api";
import Spinner from "../../../components/Spinner";
import Alert from "../../../components/Alert";
import { BiPlus, BiEdit } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import SearchInput from "../../../components/forms/SearchInput";

export default function ViewCustomerPage() {
  const [fetchData, setFetchData] = useState({
    customers: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [search, setSearch] = useState({
    customers: [],
    query: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/customers/all`)
      .then((res) => {
        if (res.data?.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            error: "",
            empty: "Such hollow, much empty...",
            loading: false,
          }));
        } else {
          setSearch((prev) => ({ ...prev, customers: res.data, query: "" }));
          setFetchData((prev) => ({
            ...prev,
            customers: res.data,
            error: "",
            empty: "",
            loading: false,
          }));
        }
      })
      .catch((e) => {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFetchData((prev) => ({
          ...prev,
          error: error.message,
          empty: "",
          loading: false,
        }));
      });
  }, []);

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = fetchData.customers.filter((customer) =>
        customer.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(e.target.value.toLowerCase().replace(/\s+/g, ""))
      );
      setSearch((prev) => ({
        ...prev,
        customers: searched,
        query: e.target.value,
      }));
    } else {
      setSearch((prev) => ({
        ...prev,
        customers: fetchData.customers,
        query: e.target.value,
      }));
    }
  };

  const onClearQuery = () => {
    setSearch((prev) => ({
      ...prev,
      customers: fetchData.customers,
      query: "",
    }));
  };

  const onAdd = () => {
    navigate(`/configure/draft-customer`);
  };

  const onEdit = (id: number) => {
    navigate(`/configure/draft-customer/${id}`);
  };

  if (fetchData.loading) {
    return <Spinner></Spinner>;
  }

  if (fetchData.error) {
    return (
      <div className="w-11/12 sm:w-8/12 xl:w-6/12 mx-auto">
        <Alert type="error" message={fetchData.error}></Alert>
      </div>
    );
  }

  return (
    <section className="min-h-screen">
      <h1 className="font-bold text-xl text-center my-4">View customer</h1>
      <div className="fixed bottom-24 right-6 md:right-8 z-20">
        <button className="btn btn-primary btn-circle" onClick={onAdd}>
          <span>
            <BiPlus className="w-8 h-8"></BiPlus>
          </span>
        </button>
      </div>
      <div className="mb-5 w-11/12 sm:w-8/12 xl:w-6/12 mx-auto">
        <SearchInput
          id="customer-search"
          placeholder="Search customer"
          name="customer-search"
          value={search.query}
          onChange={(e) => onChangeSearch(e)}
          onClear={onClearQuery}
          onFocus={null}
        ></SearchInput>
      </div>
      <div className="grid grid-cols-12 gap-4 px-4">
        {search.customers.map((customer) => (
          <div
            key={customer.id}
            className="col-span-12 sm:col-span-6 xl:col-span-3 custom-card flex items-center"
          >
            <button
              className="btn btn-accent btn-circle mr-4"
              onClick={() => onEdit(customer.id)}
            >
              <span>
                <BiEdit className="h-6 w-6"></BiEdit>
              </span>
            </button>
            <div className="flex flex-col">
              <span className="font-medium">{customer.name}</span>
              <span className="text-sm text-neutral">
                {customer.discontinued ? "Not available" : "Available"}
              </span>
            </div>
          </div>
        ))}
      </div>
      {search.customers?.length < 1 ? (
        <div className="text-center">Not found.</div>
      ) : null}
    </section>
  );
}
