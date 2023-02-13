import { useEffect, useState } from "react";
import { BiEdit, BiPlus } from "react-icons/bi";
import { useNavigate } from "react-router";
import Alert from "../../../components/Alert";
import SearchInput from "../../../components/forms/SearchInput";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";

export default function ViewVendorPage() {
  const [fetchData, setFetchData] = useState({
    vendors: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [search, setSearch] = useState({
    vendors: [],
    query: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/vendors/all`)
      .then((res) => {
        if (res.data?.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            error: "",
            empty: "Such hollow, much empty...",
            loading: false,
          }));
        } else {
          setSearch((prev) => ({ ...prev, vendors: res.data, query: "" }));
          setFetchData((prev) => ({
            ...prev,
            vendors: res.data,
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
      const searched = fetchData.vendors.filter((vendor) =>
        vendor.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(e.target.value.toLowerCase().replace(/\s+/g, ""))
      );
      setSearch((prev) => ({
        ...prev,
        vendors: searched,
        query: e.target.value,
      }));
    } else {
      setSearch((prev) => ({
        ...prev,
        vendors: fetchData.vendors,
        query: e.target.value,
      }));
    }
  };

  const onClearQuery = () => {
    setSearch((prev) => ({
      ...prev,
      vendors: fetchData.vendors,
      query: "",
    }));
  };

  const onAdd = () => {
    navigate(`/configure/draft-vendor`);
  };

  const onEdit = (id: number) => {
    navigate(`/configure/draft-vendor/${id}`);
  };

  if (fetchData.loading) {
    return <Spinner></Spinner>;
  }

  if (fetchData.error) {
    return (
      <div className="mx-auto w-11/12 sm:w-8/12 xl:w-6/12">
        <Alert type="error" message={fetchData.error}></Alert>
      </div>
    );
  }

  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">View vendor</h1>
      <div className="fixed bottom-24 right-6 z-20 md:right-8">
        <button className="btn-primary btn-circle btn" onClick={onAdd}>
          <span>
            <BiPlus className="h-8 w-8"></BiPlus>
          </span>
        </button>
      </div>
      <div className="mx-auto mb-5 w-11/12 sm:w-8/12 xl:w-6/12">
        <SearchInput
          id="vendor-search"
          placeholder="Search vendor"
          name="vendor-search"
          value={search.query}
          onChange={(e) => onChangeSearch(e)}
          onClear={onClearQuery}
          onFocus={null}
        ></SearchInput>
      </div>
      <div className="grid grid-cols-12 gap-4 px-4">
        {search.vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="custom-card col-span-12 flex items-center sm:col-span-6 xl:col-span-3"
          >
            <button
              className="btn-accent btn-circle btn mr-4"
              onClick={() => onEdit(vendor.id)}
            >
              <span>
                <BiEdit className="h-6 w-6"></BiEdit>
              </span>
            </button>
            <div className="flex flex-col">
              <span className="font-medium">{vendor.name}</span>
              <span className="text-sm text-neutral">
                {vendor.discontinued ? "Not available" : "Available"}
              </span>
            </div>
          </div>
        ))}
      </div>
      {search.vendors?.length < 1 ? (
        <div className="text-center">Not found.</div>
      ) : null}
    </section>
  );
}
