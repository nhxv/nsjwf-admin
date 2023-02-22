import { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { Role } from "../../../../commons/enums/role.enum";
import Alert from "../../../../components/Alert";
import SearchInput from "../../../../components/forms/SearchInput";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { useAuthStore } from "../../../../stores/auth.store";

export default function StockList() {
  const [fetchData, setFetchData] = useState({
    stock: [],
    error: "",
    empty: "",
    loading: true,
  });
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const [search, setSearch] = useState({
    stock: [],
    query: "",
  });

  useEffect(() => {
    api
      .get(`/stock`)
      .then((res) => {
        if (res.data?.length === 0) {
          setFetchData((prev) => ({
            ...prev,
            stock: [],
            error: "",
            empty: "Such hollow, much empty...",
            loading: false,
          }));
        } else {
          const boxStock = res.data.map((s) => ({
            name: s.name,
            measures: s.measures.filter(
              (m) => m.unitCode.split("_")[1] === "BOX"
            ),
          }));
          setSearch((prev) => ({ ...prev, stock: boxStock, query: "" }));
          setFetchData((prev) => ({
            ...prev,
            stock: boxStock,
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
          stock: [],
          error: error.message,
          empty: "",
          loading: false,
        }));
      });
  }, []);

  const onChangeStock = () => {
    navigate(`/stock/change-stock`);
  };

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = fetchData.stock.filter((product) =>
        product.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(e.target.value.toLowerCase().replace(/\s+/g, ""))
      );
      setSearch((prev) => ({
        ...prev,
        stock: searched,
        query: e.target.value,
      }));
    } else {
      setSearch((prev) => ({
        ...prev,
        stock: fetchData.stock,
        query: e.target.value,
      }));
    }
  };

  const onClearQuery = () => {
    setSearch((prev) => ({ ...prev, stock: fetchData.stock, query: "" }));
  };

  const parseFraction = (s) => {
    if (!s.includes("/")) {
      return Math.floor(parseInt(s));
    }
    const [numerator, denominator] = s.split("/");
    return Math.floor(numerator / denominator);
  };

  if (fetchData.loading) {
    return <Spinner></Spinner>;
  }

  if (fetchData.error) {
    return (
      <div className="mx-auto w-11/12 md:w-10/12 lg:w-6/12">
        <Alert type="error" message={fetchData.error}></Alert>
      </div>
    );
  }

  if (fetchData.empty) {
    return (
      <div className="mx-auto w-11/12 md:w-10/12 lg:w-6/12">
        <Alert type="empty" message={fetchData.empty}></Alert>
      </div>
    );
  }

  return (
    <>
      {role === Role.MASTER || role === Role.ADMIN ? (
        <div className="fixed bottom-24 right-6 z-20 md:right-8">
          <button
            type="button"
            className="btn-primary btn-circle btn"
            onClick={onChangeStock}
          >
            <span>
              <BiEdit className="h-6 w-6"></BiEdit>
            </span>
          </button>
        </div>
      ) : null}
      <div className="mx-auto mb-5 w-11/12 md:w-10/12 lg:w-6/12">
        <SearchInput
          id="stock-search"
          name="stock-search"
          placeholder="Search stock"
          value={search.query}
          onChange={(e) => onChangeSearch(e)}
          onClear={onClearQuery}
          onFocus={null}
        ></SearchInput>
      </div>
      <div className="grid grid-cols-12 gap-2 px-4">
        {search.stock.map((product) => (
          <div
            key={product.name}
            className="rounded-btn col-span-12 flex items-center justify-between bg-base-100 p-3 shadow-md dark:bg-base-200 md:col-span-6 lg:col-span-3"
          >
            <div>
              <span>{product.name}</span>
            </div>
            <div>
              <span>{parseFraction(product.measures[0].quantity)}</span>
            </div>
          </div>
        ))}
      </div>
      {search.stock?.length < 1 ? (
        <div className="text-center">Not found.</div>
      ) : null}
    </>
  );
}
