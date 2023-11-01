import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { BiEdit } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { Role } from "../../../../commons/enums/role.enum";
import {
  niceVisualDecimal,
  parseFraction,
} from "../../../../commons/utils/fraction.util";
import { AlertFromQueryError } from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import SearchInput from "../../../../components/forms/SearchInput";
import api from "../../../../stores/api";
import { useAuthStore } from "../../../../stores/auth.store";

export default function StockList() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const [search, setSearch] = useState({
    products: [],
    query: "",
  });
  const total = useMemo(() => {
    return niceVisualDecimal(
      search.products.reduce(
        (prev, curr) =>
          prev +
          (!curr.recent_cost
            ? 0
            : curr.recent_cost * parseFraction(curr.stock.quantity)),
        0
      )
    );
  }, [search.products]);

  const stockQuery = useQuery<any, any>({
    queryKey: ["stocks"],
    queryFn: async () => {
      const result = await api.get("/stock");
      setSearch((prev) => ({ ...prev, products: result.data }));
      return result.data;
    },
  });

  const onChangeStock = () => {
    navigate(`/stock/change-stock`);
  };

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = stockQuery.data.filter((product) =>
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
        products: stockQuery.data,
        query: e.target.value,
      }));
    }
  };

  const onClearQuery = () => {
    setSearch((prev) => ({
      ...prev,
      products: stockQuery.data,
      query: "",
    }));
  };

  if (
    stockQuery.status === "loading" ||
    stockQuery.fetchStatus === "fetching"
  ) {
    return <Spinner></Spinner>;
  }

  if (
    stockQuery.fetchStatus === "paused" ||
    (stockQuery.status === "error" && stockQuery.fetchStatus === "idle")
  ) {
    return (
      <div className="mx-auto w-11/12 md:w-10/12 lg:w-6/12">
        <AlertFromQueryError queryError={stockQuery.error} />
      </div>
    );
  }

  return (
    <>
      {(role === Role.MASTER || role === Role.ADMIN) && (
        <div className="fixed bottom-24 right-6 z-20 md:right-8">
          <button
            type="button"
            className="btn btn-circle btn-primary"
            onClick={onChangeStock}
          >
            <span>
              <BiEdit className="h-6 w-6"></BiEdit>
            </span>
          </button>
        </div>
      )}
      <div className="m-4 flex flex-col items-center justify-between gap-3 xl:flex-row">
        <div className="flex items-center gap-2">
          <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
            <span>
              {search.products.length}{" "}
              {search.products.length > 1 ? "products" : "product"}
            </span>
          </div>
          <div className="rounded-btn flex items-center bg-info p-2 text-sm font-semibold text-info-content">
            <span>${total} in total</span>
          </div>
        </div>

        <div className="flex w-full flex-col-reverse gap-2 md:flex-row xl:w-5/12 xl:flex-row">
          <div className="flex w-full flex-row gap-2">
            <SearchInput
              id="products-search"
              name="products-search"
              placeholder="Search products"
              value={search.query}
              onChange={(e) => onChangeSearch(e)}
              onClear={onClearQuery}
              onFocus={null}
            ></SearchInput>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 px-4">
        {search.products.map((p) => (
          <div
            key={p.name}
            className="rounded-btn col-span-12 flex items-center justify-between bg-base-100 p-3 shadow-md dark:bg-base-200 md:col-span-6 lg:col-span-3"
          >
            <div>
              <span>{p.name}</span>
            </div>
            <div>
              <span>{parseFraction(p.stock.quantity)}</span>
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
