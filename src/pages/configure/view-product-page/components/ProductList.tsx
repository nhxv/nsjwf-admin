import { useEffect, useState } from "react";
import { BiEdit, BiPlus } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import Alert from "../../../../components/Alert";
import SearchInput from "../../../../components/forms/SearchInput";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { handleTokenExpire } from "../../../../commons/utils/token.util";

export default function ProductList() {
  const [fetchData, setFetchData] = useState({
    products: [],
    error: "",
    empty: "",
    loading: true,
  });
  const [search, setSearch] = useState({
    products: [],
    query: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/products/all`)
      .then((res) => {
        if (res.data?.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            error: "",
            empty: "Such hollow, much empty...",
            loading: false,
          }));
        } else {
          setSearch((prev) => ({ ...prev, products: res.data, query: "" }));
          setFetchData((prev) => ({
            ...prev,
            products: res.data,
            error: "",
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

        if (error.status === 401) {
          handleTokenExpire(navigate, setFetchData);
        }
      });
  }, []);

  const onAdd = () => {
    navigate(`/configure/draft-product`);
  };

  const onEdit = (id: number) => {
    navigate(`/configure/draft-product/${id}`);
  };

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = fetchData.products.filter((product) =>
        product.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(e.target.value.toLowerCase().replace(/\s+/g, ""))
      );
      setSearch((prev) => ({
        ...prev,
        products: searched,
        query: e.target.value,
      }));
    } else {
      setSearch((prev) => ({
        ...prev,
        products: fetchData.products,
        query: e.target.value,
      }));
    }
  };

  const onClearQuery = () => {
    setSearch((prev) => ({
      ...prev,
      products: fetchData.products,
      query: "",
    }));
  };

  if (fetchData.loading) {
    return <Spinner></Spinner>;
  }

  if (fetchData.error) {
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
          <Alert type="error" message={fetchData.error}></Alert>
        </div>
      </>
    );
  }

  if (fetchData.empty) {
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
          <Alert type="empty" message={fetchData.empty}></Alert>
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
      <div className="mx-auto mb-5 w-11/12 md:w-10/12 lg:w-6/12">
        <SearchInput
          id="product-search"
          placeholder="Search product"
          name="product-search"
          value={search.query}
          onChange={(e) => onChangeSearch(e)}
          onClear={onClearQuery}
          onFocus={null}
        ></SearchInput>
      </div>
      <div className="grid grid-cols-12 gap-4 px-4">
        {search.products.map((product) => (
          <div
            key={product.id}
            className="custom-card col-span-12 flex items-center md:col-span-6 lg:col-span-3"
          >
            <button
              className="btn btn-circle btn-accent mr-4"
              onClick={() => onEdit(product.id)}
            >
              <span>
                <BiEdit className="h-6 w-6"></BiEdit>
              </span>
            </button>
            <div className="flex flex-col">
              <span className="font-medium">{product.name}</span>
              <span className="text-sm text-neutral">
                {product.discontinued ? "Not available" : "Available"}
              </span>
            </div>
          </div>
        ))}
      </div>
      {search.products?.length < 1 && (
        <div className="text-center">Not found.</div>
      )}
    </>
  );
}
