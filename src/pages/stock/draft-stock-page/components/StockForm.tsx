import { useFormik } from "formik";
import { useState } from "react";
import { BiX } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { StockChangeReason } from "../../../../commons/enums/stock-change-reason.enum";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import NumberInput from "../../../../components/forms/NumberInput";
import SearchSuggest from "../../../../components/forms/SearchSuggest";
import SelectInput from "../../../../components/forms/SelectInput";
import api from "../../../../stores/api";

export default function StockForm({ initialData, products, onClear }) {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [search, setSearch] = useState({
    products: [],
    query: "",
  });

  const stockForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      setFormState((prev) => ({
        ...prev,
        success: "",
        error: "",
        loading: true,
      }));
      try {
        const reqData = {};
        reqData["reason"] = data["reason"];
        let stock = new Map();
        const properties = Object.keys(data).sort();
        for (const property of properties) {
          if (property.includes("quantity")) {
            const id = +property.replace("quantity", "");
            const selected = selectedProducts.find((p) => p.id === id);
            if (selected) {
              stock.set(selected.id, {
                productName: selected.name,
                quantity: data[property],
              });
            }
          } else if (property.includes("unit")) {
            const id = +property.replace("unit", "");
            const selected = selectedProducts.find((p) => p.id === id);
            if (selected) {
              stock.set(selected.id, {
                ...stock.get(selected.id),
                unitCode: `${selected.id}_${data[property]}`,
              });
            }
          }
        }
        reqData["stock"] = [...stock.values()];
        const res = await api.put(`/stock`, reqData);
        setFormState((prev) => ({
          ...prev,
          success: "Update stock successfully.",
          error: "",
          loading: false,
        }));
        setTimeout(() => {
          setFormState((prev) => ({ ...prev, success: "" }));
          onClear();
        }, 2000);
      } catch (e) {
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFormState((prev) => ({
          ...prev,
          error: error.message,
          success: "",
          loading: false,
        }));

        if (error.status === 401) {
          handleTokenExpire(navigate, setFormState);
        }
      }
    },
  });

  const onClearForm = () => {
    onClear();
  };

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = products.filter((product) =>
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
      setSearch((prev) => ({ ...prev, products: [], query: e.target.value }));
    }
  };

  const onAddProduct = (product) => {
    const found = selectedProducts.find((p) => p.name === product.name);
    if (!found) {
      setSelectedProducts([product, ...selectedProducts]);
      stockForm.setFieldValue(`quantity${product.id}`, 0);
      stockForm.setFieldValue(`unit${product.id}`, "BOX");
    }
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
  };

  const onRemoveProduct = (id) => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
    stockForm.setFieldValue(`quantity${id}`, 0);
    setSelectedProducts(
      selectedProducts.filter((product) => product.id !== id)
    );
  };

  const onClearQuery = () => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
  };

  return (
    <>
      <form onSubmit={stockForm.handleSubmit}>
        <div className="mb-5">
          <label htmlFor="reason" className="custom-label mb-2 inline-block">
            Reason
          </label>
          <SelectInput
            name="reason"
            value={stockForm.values["reason"]}
            setValue={(v) => stockForm.setFieldValue("reason", v)}
            options={Object.values(StockChangeReason).filter(
              (reason) =>
                reason !== StockChangeReason.CUSTOMER_ORDER_COMPLETED &&
                reason !== StockChangeReason.CUSTOMER_RETURN_RECEIVED &&
                reason !== StockChangeReason.VENDOR_ORDER_COMPLETED &&
                reason !== StockChangeReason.VENDOR_RETURN_RECEIVED &&
                reason !== StockChangeReason.EMPLOYEE_BORROW
            )}
          ></SelectInput>
        </div>

        <div className="mb-5">
          <SearchSuggest
            query={search.query}
            items={search.products}
            onChange={(e) => onChangeSearch(e)}
            onFocus={() =>
              setSearch((prev) => ({ ...prev, products: products, query: "" }))
            }
            onSelect={onAddProduct}
            onClear={onClearQuery}
            allowOverlap
          ></SearchSuggest>
        </div>

        <div className="mb-5">
          {selectedProducts && selectedProducts.length > 0 ? (
            <div className="grid grid-cols-12 gap-3">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-box col-span-12 flex flex-col border-2 border-base-300 p-3 md:col-span-6"
                >
                  <div className="mb-3 flex justify-between">
                    <div>
                      <span className="text-lg font-semibold">
                        {product.name}
                      </span>
                      <span className="block text-sm text-neutral">
                        Product
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-circle btn-accent btn-sm"
                      onClick={() => onRemoveProduct(product.id)}
                    >
                      <span>
                        <BiX className="h-6 w-6"></BiX>
                      </span>
                    </button>
                  </div>
                  <div className="mb-2 flex gap-2">
                    <div className="w-6/12">
                      <label className="custom-label mb-2 inline-block">
                        Qty
                      </label>
                      <NumberInput
                        id={`quantity${product.id}`}
                        name={`quantity${product.id}`}
                        placeholder="Qty"
                        value={stockForm.values[`quantity${product.id}`]}
                        onChange={stockForm.handleChange}
                      ></NumberInput>
                    </div>
                    <div className="w-6/12">
                      <label className="custom-label mb-2 inline-block">
                        Unit
                      </label>
                      <SelectInput
                        name={`unit${product.id}`}
                        value={stockForm.values[`unit${product.id}`]}
                        setValue={(v) =>
                          stockForm.setFieldValue(`unit${product.id}`, v)
                        }
                        options={product.units.map(
                          (unit) => unit.code.split("_")[1]
                        )}
                      ></SelectInput>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-2 mt-5 flex justify-center">
              <span>Empty.</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary my-3 w-full"
          disabled={formState.loading || stockForm.isSubmitting}
        >
          Update Stock
        </button>
        <button
          type="button"
          className="btn btn-accent w-full"
          onClick={onClearForm}
        >
          Clear change(s)
        </button>

        <div>
          {formState.loading && (
            <div className="mt-5">
              <Spinner></Spinner>
            </div>
          )}
          {formState.error && (
            <div className="mt-5">
              <Alert message={formState.error} type="error"></Alert>
            </div>
          )}
          {formState.success && (
            <div className="mt-5">
              <Alert message={formState.success} type="success"></Alert>
            </div>
          )}
        </div>
      </form>
    </>
  );
}
