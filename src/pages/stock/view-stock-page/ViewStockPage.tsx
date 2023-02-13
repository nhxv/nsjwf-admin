import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "../../../commons/role.enum";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import api from "../../../stores/api";
import { useAuthStore } from "../../../stores/auth.store";
import { BiEdit } from "react-icons/bi";
import SearchInput from "../../../components/forms/SearchInput";

export default function ViewStockPage() {
  const [stock, setStock] = useState(null);
  const [dataState, setDataState] = useState({
    error: "",
    empty: "",
    loading: true,
  });
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const [query, setQuery] = useState("");
  const [searchedStocks, setSearchedStocks] = useState([]);

  useEffect(() => {
    api
      .get(`/product-stock`)
      .then((res) => {
        if (res.data?.length === 0) {
          setDataState((prev) => ({
            ...prev,
            error: "",
            empty: "Such hollow, much empty...",
            loading: false,
          }));
        } else {
          setStock(res.data);
          setSearchedStocks(res.data);
          setDataState((prev) => ({
            ...prev,
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
        setDataState((prev) => ({
          ...prev,
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
      const searched = stock.filter((product) =>
        product.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(e.target.value.toLowerCase().replace(/\s+/g, ""))
      );
      setSearchedStocks(searched);
    } else {
      setSearchedStocks(stock);
    }
    setQuery(e.target.value);
  };

  const onClearQuery = () => {
    setSearchedStocks(stock);
    setQuery("");
  };

  return (
    <section className="min-h-screen">
      <h1 className="my-4 text-center text-xl font-bold">View stock</h1>
      <div className="flex flex-col items-center">
        {dataState.loading ? (
          <Spinner></Spinner>
        ) : (
          <div className="container px-4">
            {dataState.error ? (
              <Alert message={dataState.error} type="error"></Alert>
            ) : (
              <>
                {dataState.empty ? (
                  <Alert message={dataState.empty} type="empty"></Alert>
                ) : (
                  <>
                    <div className="w-12/12 sm:8/12 mx-auto mb-5 xl:w-6/12">
                      <SearchInput
                        id="stock-search"
                        name="stock-search"
                        placeholder="Search stock"
                        value={query}
                        onChange={(e) => onChangeSearch(e)}
                        onClear={onClearQuery}
                        onFocus={null}
                      ></SearchInput>
                    </div>
                    <div className="mb-12">
                      <div className="grid grid-cols-12 gap-2">
                        {searchedStocks.map((product) => (
                          <div
                            key={product.name}
                            className="rounded-btn col-span-12 flex items-center justify-between bg-base-100 p-3 shadow-md dark:bg-base-200 sm:col-span-6 xl:col-span-3"
                          >
                            <div>
                              <span>{product.name}</span>
                            </div>
                            <div>
                              <span>{product.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {searchedStocks?.length < 1 ? (
                        <div className="text-center">Not found.</div>
                      ) : null}
                      {role === Role.MASTER || role === Role.ADMIN ? (
                        <div className="mt-8 flex justify-center">
                          <button
                            type="button"
                            className="btn-accent btn"
                            onClick={onChangeStock}
                          >
                            <BiEdit className="mr-1 h-6 w-6"></BiEdit>
                            <span>Change stock</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
