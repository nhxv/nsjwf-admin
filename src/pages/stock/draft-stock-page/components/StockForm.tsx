import { Controller, useFieldArray, useForm } from "react-hook-form";
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

interface IStockRow {
  productId: number;
  name: string;
  quantity: number;
  unit: string;
  units: Array<any>;
}

interface IStockFormFields {
  reason: string;
  stock: IStockRow[];
}

export default function StockForm({ initialData, products, onClear }) {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
  });

  const [search, setSearch] = useState({
    products: [],
    query: "",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<IStockFormFields>({
    values: initialData,
  });

  // `productId` (not `id`) to avoid colliding with the internal `id` RHF
  // assigns to each row for React keys.
  const { fields, prepend, remove } = useFieldArray({
    control,
    name: "stock",
  });

  const onSubmit = async (data) => {
    setFormState((prev) => ({
      ...prev,
      success: "",
      error: "",
      loading: true,
    }));
    try {
      const reqData = {};
      reqData["reason"] = data["reason"];
      reqData["stock"] = data.stock.map((row) => ({
        productName: row.name,
        quantity: row.quantity,
        unitCode: `${row.productId}_${row.unit}`,
      }));
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
      const error = JSON.parse(JSON.stringify(e.response ? e.response.data.error : e));
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
  };

  const onClearForm = () => {
    onClear();
  };

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = products.filter((product) => product.name.toLowerCase().replace(/\s+/g, "").includes(e.target.value.toLowerCase().replace(/\s+/g, "")));
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
    const found = fields.find((f) => f.productId === product.id);
    if (!found) {
      prepend({
        productId: product.id,
        name: product.name,
        quantity: 0,
        unit: "BOX",
        units: product.units,
      });
    }
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
  };

  const onClearQuery = () => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label htmlFor="reason" className="custom-label mb-2 inline-block">
            Reason
          </label>
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <SelectInput
                name={field.name}
                value={field.value}
                setValue={field.onChange}
                options={Object.values(StockChangeReason).filter(
                  (reason) =>
                    reason !== StockChangeReason.CUSTOMER_ORDER_COMPLETED &&
                    reason !== StockChangeReason.CUSTOMER_RETURN_RECEIVED &&
                    reason !== StockChangeReason.VENDOR_ORDER_COMPLETED &&
                    reason !== StockChangeReason.VENDOR_RETURN_RECEIVED &&
                    reason !== StockChangeReason.EMPLOYEE_BORROW,
                )}></SelectInput>
            )}
          />
        </div>

        <div className="mb-5">
          <SearchSuggest
            query={search.query}
            items={search.products}
            onChange={(e) => onChangeSearch(e)}
            onFocus={() => setSearch((prev) => ({ ...prev, products: products, query: "" }))}
            onSelect={onAddProduct}
            onClear={onClearQuery}
            allowOverlap></SearchSuggest>
        </div>

        <div className="mb-5">
          {fields && fields.length > 0 ? (
            <div className="grid grid-cols-12 gap-3">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-box col-span-12 flex flex-col border-2 border-base-300 p-3 md:col-span-6">
                  <div className="mb-3 flex justify-between">
                    <div>
                      <span className="text-lg font-semibold">{field.name}</span>
                      <span className="block text-sm text-neutral">Product</span>
                    </div>
                    <button type="button" className="btn btn-circle btn-accent btn-sm" onClick={() => remove(index)}>
                      <span>
                        <BiX className="h-6 w-6"></BiX>
                      </span>
                    </button>
                  </div>
                  <div className="mb-2 flex gap-2">
                    <div className="w-6/12">
                      <label className="custom-label mb-2 inline-block">Qty</label>
                      <Controller
                        name={`stock.${index}.quantity`}
                        control={control}
                        render={({ field }) => (
                          <NumberInput
                            id={`quantity${field.name}`}
                            name={field.name}
                            placeholder="Qty"
                            value={field.value}
                            onChange={field.onChange}></NumberInput>
                        )}
                      />
                    </div>
                    <div className="w-6/12">
                      <label className="custom-label mb-2 inline-block">Unit</label>
                      <Controller
                        name={`stock.${index}.unit`}
                        control={control}
                        render={({ field: unitField }) => (
                          <SelectInput
                            name={unitField.name}
                            value={unitField.value}
                            setValue={unitField.onChange}
                            options={field.units.map((unit) => unit.code.split("_")[1])}></SelectInput>
                        )}
                      />
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

        <button type="submit" className="btn btn-primary my-3 w-full" disabled={formState.loading || isSubmitting}>
          Update Stock
        </button>
        <button type="button" className="btn btn-accent w-full" onClick={onClearForm}>
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
