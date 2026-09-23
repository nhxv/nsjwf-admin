import { Controller, useForm, useWatch } from "react-hook-form";
import { useState } from "react";
import { BiLeftArrowAlt, BiRightArrowAlt, BiX } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import Alert from "../../../../components/Alert";
import Checkbox from "../../../../components/forms/Checkbox";
import DateInput from "../../../../components/forms/DateInput";
import NumberInput from "../../../../components/forms/NumberInput";
import SearchSuggest from "../../../../components/forms/SearchSuggest";
import SelectInput from "../../../../components/forms/SelectInput";
import SelectSearch from "../../../../components/forms/SelectSearch";
import TextInput from "../../../../components/forms/TextInput";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";

export default function CustomerOrderForm({
  edit,
  initialData,
  customers,
  editedProducts,
  allProducts,
  employees,
  updatePrice,
  resetPrice,
  total,
  loadTemplate,
  onClear,
}) {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
    page: 0,
  });

  const navigate = useNavigate();

  const [availableProducts, _] = useState(
    allProducts.filter((product) => !product.discontinued)
  );
  const [selectedProducts, setSelectedProducts] = useState(
    editedProducts ? editedProducts : []
  );
  const [search, setSearch] = useState({
    products: [],
    query: "",
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    values: initialData,
  });

  // Mirrors Formik's `values` object: a single reactive snapshot of the whole
  // form, used for the derived per-row Amount display below. Reading this
  // per-row inside .map() (instead of calling useWatch per-row) keeps the
  // number of hooks called by this component constant across renders.
  const watchedValues = useWatch({ control });

  const onSubmit = async (data) => {
    setFormState((prev) => ({
      ...prev,
      error: "",
      empty: "",
      loading: true,
    }));
    try {
      let reqData = {};
      let productOrders = new Map();
      reqData["customerName"] = data["customerName"];
      reqData["assignTo"] = data["employeeName"];
      reqData["status"] = data["status"];
      reqData["isTest"] = data["isTest"];
      reqData["manualCode"] = data["manualCode"];
      reqData["expectedAt"] = data["expectedAt"];
      reqData["note"] = data["note"] ? data["note"] : ""; // Just to make sure it's str
      const properties = Object.keys(data).sort();
      for (const property of properties) {
        if (property.includes("price")) {
          const [id, appear] = property.replace("price", "").split("-");
          const selected = selectedProducts.find(
            (p) => p.id === +id && p.appear === +appear
          );
          if (selected) {
            productOrders.set(`${selected.id}-${selected.appear}`, {
              productName: selected.name,
              // Allow price to be empty.
              unitPrice: data[property] ? data[property] : "",
            });
          }
        } else if (property.includes("quantity")) {
          const [id, appear] = property.replace("quantity", "").split("-");
          const selected = selectedProducts.find(
            (p) => p.id === +id && p.appear === +appear
          );
          if (selected) {
            productOrders.set(`${selected.id}-${selected.appear}`, {
              ...productOrders.get(`${selected.id}-${selected.appear}`),
              quantity: data[property],
            });
          }
        } else if (property.includes("unit")) {
          const [id, appear] = property.replace("unit", "").split("-");
          const selected = selectedProducts.find(
            (p) => p.id === +id && p.appear === +appear
          );
          if (selected) {
            productOrders.set(`${selected.id}-${selected.appear}`, {
              ...productOrders.get(`${selected.id}-${selected.appear}`),
              unitCode: `${selected.id}_${data[property]}`,
            });
          }
        }
      }
      reqData["productCustomerOrders"] = [...productOrders.values()];
      setFormState((prev) => ({
        ...prev,
        error: "",
        empty: "",
        loading: false,
      }));
      if (edit) {
        // edit order
        reqData["code"] = data["code"];
        const res = await api.put(
          `/customer-orders/${reqData["code"]}`,
          reqData
        );
        if (res) {
          navigate(`/customer/view-customer-order-detail/${reqData["code"]}`);
        }
      } else {
        // create order
        const res = await api.post(`/customer-orders`, reqData);
        if (res) {
          navigate(`/customer/view-customer-order-detail/${res.data.code}`);
        }
      }
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
  };

  const handlePriceChange = (field, e, inputId: string) => {
    field.onChange(e);
    updatePrice(+e.target.value, inputId);
  };

  const onClearForm = () => {
    onClear();
  };

  const onNextPage = async () => {
    if (!edit && selectedProducts.length === 0) {
      setFormState((prev) => ({
        ...prev,
        error: "",
        empty: "",
        loading: true,
      }));
      const template = await loadTemplate(watchedValues[`customerName`]);
      if (template) {
        const selected = [];
        const updatedPrices = [];
        // NOTE: For now, we keep this at allProducts because updating discontinued product is a bit confusing right now.
        for (const product of allProducts) {
          const appear = 1;
          const found = template.find((p) => p.name === product.name);
          if (found) {
            // template only allows product to appear once -> if found, appear = 1
            selected.push({
              id: product.id,
              appear: appear,
              name: product.name,
              recent_cost: product.recent_cost,
              units: product.units,
            });
            setValue(`quantity${product.id}-${appear}`, found.quantity);
            setValue(
              `unit${product.id}-${appear}`,
              found.unit_code.split("_")[1]
            );
            setValue(`price${product.id}-${appear}`, 0);
            updatedPrices.push({
              id: product.id,
              appear: appear,
              quantity: found.quantity,
              price: 0,
            });
            for (let i = 2; i <= product.units.length; i++) {
              updatedPrices.push({
                id: product.id,
                appear: i,
                quantity: 0,
                price: 0,
              });
            }
          } else {
            for (let i = 1; i <= product.units.length; i++) {
              updatedPrices.push({
                id: product.id,
                appear: i,
                quantity: 0,
                price: 0,
              });
            }
          }
        }
        resetPrice(updatedPrices);
        setSelectedProducts(selected);
      }
      setFormState((prev) => ({
        ...prev,
        error: "",
        empty: "",
        loading: false,
      }));
    }
    setFormState((prev) => ({ ...prev, page: 1 }));
  };

  const onPreviousPage = () => {
    setFormState((prev) => ({ ...prev, page: 0 }));
  };

  const onChangeSearch = (e) => {
    if (e.target.value) {
      const searched = availableProducts.filter((product) =>
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
        products: availableProducts,
        query: e.target.value,
      }));
    }
  };

  const onAddProduct = (product) => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
    const found = selectedProducts.filter((p) => p.name === product.name);
    if (found.length >= product.units.length) {
      // cannot add more of this product, but we'll bump them up the list for searching purpose
      setSelectedProducts([
        ...found,
        ...selectedProducts.filter((p) => p.name !== product.name),
      ]);
      return;
    }

    let appear;
    if (found.length === 0) {
      // first time this product appears
      appear = 1;
    } else {
      // this product appears more than 1 & less than the maximum time it's allowed to appear

      // have to do this cuz if there are 3 units (so we'll have appear 1 -> 3) then we remove the 2nd one out of order
      // we can't do found.length + 1 as appear.
      const currentAppear = new Set();
      for (const product of found) {
        currentAppear.add(product.appear);
      }
      // find the appear that doesn't exist (e.g. 2)
      for (let i = 1; i <= product.units.length; i++) {
        if (!currentAppear.has(i)) {
          appear = i;
          break;
        }
      }
    }
    const selectedProduct = { ...product, appear: appear };
    setSelectedProducts([
      selectedProduct,
      ...found,
      ...selectedProducts.filter((p) => p.name !== product.name),
    ]);
    setValue(`quantity${product.id}-${appear}`, 0);
    // Can't set to 0 to prevent user forgetting a field.
    setValue(`price${product.id}-${appear}`, "");
  };

  const onRemoveProduct = (id, appear) => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
    setValue(`quantity${id}-${appear}`, 0);
    setValue(`unit${id}-${appear}`, "BOX");
    setValue(`price${id}-${appear}`, 0);
    updatePrice(0, `remove${id}-${appear}`);
    setSelectedProducts(
      selectedProducts.filter(
        (product) => product.id !== id || product.appear !== appear
      )
    );
  };

  const onClearQuery = () => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {formState.page === 0 ? (
        <div className="custom-card mx-auto grid grid-cols-12 gap-x-2 xl:w-7/12">
          {/* 1st page */}
          <div className="col-span-12 mb-5 xl:col-span-6">
            <label className="custom-label mb-2 inline-block">
              <span>Order from customer</span>
              <span className="text-red-500">*</span>
            </label>
            <Controller
              name="customerName"
              control={control}
              render={({ field }) => (
                <SelectSearch
                  name="customer"
                  value={field.value}
                  setValue={field.onChange}
                  options={customers.map((customer) => customer.name)}
                />
              )}
            />
          </div>

          <div className="col-span-12 mb-5 xl:col-span-6">
            <label className="custom-label mb-2 inline-block">
              <span>Manual code</span>
            </label>
            <Controller
              name="manualCode"
              control={control}
              render={({ field }) => (
                <TextInput
                  id="manual-code"
                  type="text"
                  placeholder={`Manual code`}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                ></TextInput>
              )}
            />
          </div>

          <div className="col-span-12 mb-5 xl:col-span-6">
            <label htmlFor="expect" className="custom-label mb-2 inline-block">
              Expected delivery date
            </label>
            <Controller
              name="expectedAt"
              control={control}
              render={({ field }) => (
                <DateInput
                  id="expect"
                  min="2023-01-01"
                  max="2100-12-31"
                  placeholder="Expected Delivery Date"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                ></DateInput>
              )}
            />
          </div>

          <div className="col-span-12 mb-5 xl:col-span-3">
            <label
              htmlFor="employee"
              className="custom-label mb-2 inline-block"
            >
              Assign to
            </label>
            <Controller
              name="employeeName"
              control={control}
              render={({ field }) => (
                <SelectInput
                  name={field.name}
                  value={field.value}
                  setValue={field.onChange}
                  options={employees.map((employee) => employee.nickname)}
                ></SelectInput>
              )}
            />
          </div>

          <div className="col-span-12 mb-5 xl:col-span-3">
            <label htmlFor="status" className="custom-label mb-2 inline-block">
              Status
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <SelectInput
                  name={field.name}
                  value={field.value}
                  setValue={field.onChange}
                  options={Object.values(OrderStatus).filter(
                    (status) => status !== OrderStatus.CANCELED
                  )}
                ></SelectInput>
              )}
            />
          </div>

          {watchedValues[`customerName`] && (
            <button
              type="button"
              className="btn btn-primary col-span-12 mt-3"
              onClick={onNextPage}
              disabled={formState.loading || isSubmitting}
            >
              <span>Set product</span>
              <span>
                <BiRightArrowAlt className="ml-1 h-7 w-7"></BiRightArrowAlt>
              </span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-accent col-span-12 mt-3"
            onClick={onClearForm}
          >
            <span>Revert change(s)</span>
          </button>
        </div>
      ) : (
        <>
          {formState.page === 1 && (
            <div className="flex min-h-screen flex-col items-start gap-6 xl:flex-row-reverse">
              <div className="custom-card w-full xl:sticky xl:top-[84px] xl:w-5/12">
                <div className="mb-4 flex items-center">
                  Total:
                  <span className="mx-1 text-xl font-medium">${total}</span>
                  <span>
                    {`(${selectedProducts.length} ${
                      selectedProducts.length > 1 ? "items" : "item"
                    })`}
                  </span>
                </div>

                <div className="my-5">
                  <Controller
                    name="note"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        id="note"
                        name={field.name}
                        placeholder="Remarks"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="my-5 flex items-center">
                  <Controller
                    name="isTest"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="test"
                        name={field.name}
                        label="Test"
                        onChange={() => field.onChange(!field.value)}
                        checked={field.value}
                      ></Checkbox>
                    )}
                  />
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <button
                    type="button"
                    className="btn-outline-primary btn col-span-6"
                    onClick={onPreviousPage}
                  >
                    <span>
                      <BiLeftArrowAlt className="mr-1 h-7 w-7"></BiLeftArrowAlt>
                    </span>
                    <span>Go back</span>
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary col-span-6"
                    disabled={
                      initialData.status === "COMPLETED" ||
                      formState.loading ||
                      isSubmitting
                    }
                  >
                    <span>{edit ? "Update" : "Create"}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-accent col-span-12"
                    onClick={onClearForm}
                  >
                    <span>Clear change(s)</span>
                  </button>
                </div>

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
              </div>

              <div className="mb-5 w-full xl:w-7/12">
                <div className="mb-6">
                  <SearchSuggest
                    query={search.query}
                    items={search.products}
                    onChange={(e) => onChangeSearch(e)}
                    onFocus={() =>
                      setSearch((prev) => ({
                        ...prev,
                        products: availableProducts,
                        query: "",
                      }))
                    }
                    onSelect={onAddProduct}
                    onClear={onClearQuery}
                  ></SearchSuggest>
                </div>

                {selectedProducts && selectedProducts.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {selectedProducts.map((product) => (
                      <div
                        key={`${product.id}-${product.appear}`}
                        className="custom-card relative w-full p-3"
                      >
                        <div className="mb-2 grid grid-cols-12 items-center gap-2">
                          <div className="col-span-12 xl:col-span-4">
                            <span className="text-lg font-semibold">
                              {product.name}
                            </span>
                            {product.recent_cost ? (
                              <div className="custom-badge mt-1 bg-info text-info-content">
                                <span className="hidden sm:inline">
                                  Suggest:
                                </span>
                                <span>
                                  {" > "}${product.recent_cost}
                                </span>
                              </div>
                            ) : (
                              <div className="custom-badge mt-1 bg-accent text-accent-content">
                                <span>Product</span>
                              </div>
                            )}
                          </div>
                          <div className="col-span-6 xl:col-span-2">
                            <label className="custom-label mb-2 inline-block">
                              Qty
                            </label>
                            <Controller
                              name={`quantity${product.id}-${product.appear}`}
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  id={`quantity${product.id}-${product.appear}`}
                                  placeholder="Qty"
                                  name={field.name}
                                  value={field.value}
                                  onChange={(e) =>
                                    handlePriceChange(field, e, field.name)
                                  }
                                ></NumberInput>
                              )}
                            />
                          </div>
                          <div className="col-span-6 xl:col-span-2">
                            <label className="custom-label mb-2 inline-block">
                              Unit Price
                            </label>
                            <Controller
                              name={`price${product.id}-${product.appear}`}
                              control={control}
                              render={({ field }) => (
                                <TextInput
                                  id={`price${product.id}-${product.appear}`}
                                  placeholder="Price"
                                  name={field.name}
                                  value={field.value}
                                  onChange={(e) =>
                                    handlePriceChange(field, e, field.name)
                                  }
                                ></TextInput>
                              )}
                            />
                          </div>
                          <div className="col-span-6 xl:col-span-2">
                            <label className="custom-label mb-2 inline-block">
                              Unit
                            </label>
                            <Controller
                              name={`unit${product.id}-${product.appear}`}
                              control={control}
                              render={({ field }) => (
                                <SelectInput
                                  name={field.name}
                                  value={field.value}
                                  setValue={field.onChange}
                                  options={product.units.map(
                                    (unit) => unit.code.split("_")[1]
                                  )}
                                ></SelectInput>
                              )}
                            />
                          </div>
                          <div className="col-span-6 xl:col-span-2">
                            <div className="custom-label mb-2">Amount</div>
                            <div className="rounded-box flex h-12 items-center bg-base-300 px-3">
                              {
                                // Display amount to be more explicit for user.
                                watchedValues[
                                  `price${product.id}-${product.appear}`
                                ] === ""
                                  ? ""
                                  : watchedValues[
                                      `price${product.id}-${product.appear}`
                                    ] === "0"
                                  ? "N/C"
                                  : niceVisualDecimal(
                                      parseFloat(
                                        (
                                          watchedValues[
                                            `quantity${product.id}-${product.appear}`
                                          ] *
                                          watchedValues[
                                            `price${product.id}-${product.appear}`
                                          ]
                                        ).toString() // Silent linter.
                                      )
                                    )
                              }
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-circle btn-accent btn-sm absolute -right-4 -top-4 shadow-md"
                          onClick={() =>
                            onRemoveProduct(product.id, product.appear)
                          }
                        >
                          <span>
                            <BiX className="h-6 w-6"></BiX>
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert message={"No product selected."} type="empty"></Alert>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </form>
  );
}
