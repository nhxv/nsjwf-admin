import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../stores/api";
import { BiEdit, BiPlus } from "react-icons/bi";
import SearchInput from "../../../../components/forms/SearchInput";
import Spinner from "../../../../components/Spinner";
import Alert from "../../../../components/Alert";

export default function CustomerList() { 
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
      <>
        <div className="fixed bottom-24 right-6 z-20 md:right-8">
          <button className="btn-primary btn-circle btn" onClick={onAdd}>
            <span>
              <BiPlus className="h-8 w-8"></BiPlus>
            </span>
          </button>
        </div>      
        <div className="mx-auto w-11/12 sm:w-8/12 xl:w-6/12">
          <Alert type="error" message={fetchData.error}></Alert>
        </div>      
      </>
    );
  }

  if (fetchData.empty) {
    return (
      <>
        <div className="fixed bottom-24 right-6 z-20 md:right-8">
          <button className="btn-primary btn-circle btn" onClick={onAdd}>
            <span>
              <BiPlus className="h-8 w-8"></BiPlus>
            </span>
          </button>
        </div>      
        <div className="mx-auto w-11/12 sm:w-8/12 xl:w-6/12">
          <Alert type="empty" message={fetchData.empty}></Alert>
        </div>      
      </>
    );
  }

  return (
  <>
    <div className="fixed bottom-24 right-6 z-20 md:right-8">
      <button className="btn-primary btn-circle btn" onClick={onAdd}>
        <span>
          <BiPlus className="h-8 w-8"></BiPlus>
        </span>
      </button>
    </div>
    <div className="mx-auto mb-5 w-11/12 sm:w-8/12 xl:w-6/12">
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
          className="custom-card col-span-12 flex items-center sm:col-span-6 xl:col-span-3"
        >
          <button
            className="btn-accent btn-circle btn mr-4"
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
  </>);
}