import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../stores/api";
import { BiEdit, BiPlus } from "react-icons/bi";
import SearchInput from "../../../../components/forms/SearchInput";
import Spinner from "../../../../components/Spinner";
import Alert, { AlertFromQueryError } from "../../../../components/Alert";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import { useQuery } from "@tanstack/react-query";

export default function CustomerList() {
  const [search, setSearch] = useState({
    customers: [],
    query: "",
  });
  const navigate = useNavigate();

  // Need to force type here to silence the linter.
  const query = useQuery<any[], any>({
    queryKey: ["customers", "all"],
    queryFn: async () => {
      const res = await api.get("customers/all");
      if (res.data?.length !== 0) {
        setSearch((prev) => ({ ...prev, customers: res.data, query: "" }));
      }
      return res.data;
    },
  });

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = query.data.filter((customer) =>
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
        customers: query.data,
        query: e.target.value,
      }));
    }
  };

  const onClearQuery = () => {
    setSearch((prev) => ({
      ...prev,
      customers: query.data,
      query: "",
    }));
  };

  const onAdd = () => {
    navigate(`/configure/draft-customer`);
  };

  const onEdit = (id: number) => {
    navigate(`/configure/draft-customer/${id}`);
  };

  if (query.fetchStatus === "fetching" || query.status === "pending") {
    return <Spinner></Spinner>;
  }

  // When there's an error, React Query will update the query to have error in there.
  // However, when we refetch it, this old obj with the error will be returned first, then the new query object
  // will be returned later, so we need this extra idle check here.
  if (
    query.fetchStatus === "paused" ||
    (query.status === "error" && query.fetchStatus === "idle")
  ) {
    if (query.fetchStatus === "paused") {
      return (
        <>
          <div className="fixed bottom-24 right-6 z-20 md:right-8">
            <button className="btn btn-circle btn-primary" onClick={onAdd}>
              <span>
                <BiPlus className="h-8 w-8"></BiPlus>
              </span>
            </button>
          </div>
          <div className="mx-auto w-11/12 sm:w-8/12 xl:w-6/12">
            <Alert type="error" message="Network Error" />
          </div>
        </>
      );
    }

    return (
      <>
        <div className="fixed bottom-24 right-6 z-20 md:right-8">
          <button className="btn btn-circle btn-primary" onClick={onAdd}>
            <span>
              <BiPlus className="h-8 w-8"></BiPlus>
            </span>
          </button>
        </div>
        <div className="mx-auto w-11/12 sm:w-8/12 xl:w-6/12">
          <AlertFromQueryError queryError={query.error} />
        </div>
      </>
    );
  }

  // Only display this when the init search is empty, not client subsequent search
  if (query.data.length === 0) {
    return (
      <>
        <div className="fixed bottom-24 right-6 z-20 md:right-8">
          <button className="btn btn-circle btn-primary" onClick={onAdd}>
            <span>
              <BiPlus className="h-8 w-8"></BiPlus>
            </span>
          </button>
        </div>
        <div className="mx-auto w-11/12 sm:w-8/12 xl:w-6/12">
          <Alert type="empty" message="Such empty, much hollow..."></Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed bottom-24 right-6 z-20 md:right-8">
        <button className="btn btn-circle btn-primary" onClick={onAdd}>
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
      <div className="grid grid-cols-12 items-center gap-4 px-4">
        {search.customers.map((customer) => (
          <div
            key={customer.id}
            className="custom-card col-span-12 flex items-center sm:col-span-6 xl:col-span-3"
          >
            <button
              className="btn btn-circle btn-accent mr-4"
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
      {search.customers?.length < 1 && (
        <div className="text-center">Not found.</div>
      )}
    </>
  );
}
