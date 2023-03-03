import { useFormik } from "formik";
import { useState } from "react";
import { BiLeftArrowAlt, BiRightArrowAlt, BiX } from "react-icons/bi";
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

export default function BackorderForm({
  edit,
  initialData,
  customers,
  editedProducts,
  allProducts,
  employees,
  updatePrice,
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

  const [selectedProducts, setSelectedProducts] = useState(
    editedProducts ? editedProducts : []
  );
  const [search, setSearch] = useState({
    products: [],
    query: "",
  });

  const backorderForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      setFormState((prev) => ({
        ...prev,
        error: "",
        success: "",
        loading: true,
      }));
      try {
        let reqData = {};
        let productOrders = new Map();
        reqData["customerName"] = data["customerName"];
        reqData["assignTo"] = data["employeeName"];
        reqData["isArchived"] = data["isArchived"];
        reqData["isTest"] = data["isTest"];
        reqData["expectedAt"] = data["expectedAt"];
        const properties = Object.keys(data).sort();
        for (const property of properties) {
          if (property.includes("price")) {
            const id = +property.replace("price", "");
            const selected = selectedProducts.find((p) => p.id === id);
            if (selected) {
              productOrders.set(selected.id, {
                productName: selected.name,
                unitPrice: data[property],
              });
            }
          } else if (property.includes("quantity")) {
            const id = +property.replace("quantity", "");
            const selected = selectedProducts.find((p) => p.id === id);
            if (selected) {
              productOrders.set(id, {
                ...productOrders.get(id),
                quantity: data[property],
              });
            }
          } else if (property.includes("unit")) {
            const id = +property.replace("unit", "");
            const selected = selectedProducts.find((p) => p.id === id);
            if (selected) {
              productOrders.set(selected.id, {
                ...productOrders.get(selected.id),
                unitCode: `${selected.id}_${data[property]}`,
              });
            }
          }
        }
        reqData["productBackorders"] = [...productOrders.values()];
        if (edit) {
          reqData["id"] = data["id"];
          if (!reqData["isArchived"]) {
            // update backorder detail
            const res = await api.put(`/backorders/${reqData["id"]}`, reqData);
          } else {
            // convert backorder to customer order
            const res = await api.put(
              `/backorders/convert/${reqData["id"]}`,
              reqData
            );
          }

          setFormState((prev) => ({
            ...prev,
            success: "Updated order successfully.",
            error: "",
            loading: false,
          }));
          setTimeout(() => {
            setFormState((prev) => ({
              ...prev,
              success: "",
              error: "",
              loading: false,
            }));
            onClear();
          }, 2000);
        } else {
          // create order
          const res = await api.post(`/backorders`, reqData);
          setFormState((prev) => ({
            ...prev,
            success: "Created order successfully.",
            error: "",
            loading: false,
          }));
          setTimeout(() => {
            setFormState((prev) => ({
              ...prev,
              success: "",
              error: "",
              loading: false,
            }));
            onClear();
          }, 2000);
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
      }
    },
  });

  const handlePriceChange = (e, inputId: string) => {
    backorderForm.setFieldValue(inputId, e.target.value);
    updatePrice(+e.target.value, inputId);
  };

  const onClearForm = () => {
    onClear();
  };

  const onNextPage = async () => {
    if (!edit) {
      setFormState((prev) => ({
        ...prev,
        error: "",
        empty: "",
        loading: true,
      }));
      const template = await loadTemplate(backorderForm.values[`customerName`]);
      if (template) {
        const selected = [];
        for (const product of template) {
          const found = allProducts.find((p) => p.name === product.name);
          selected.push({
            id: found.id,
            name: found.name,
            sell_price: found.sell_price,
            units: found.units,
          });
          backorderForm.setFieldValue(`quantity${found.id}`, product.quantity);
          backorderForm.setFieldValue(
            `unit${found.id}`,
            product.unit_code.split("_")[1]
          );
          updatePrice(product.quantity, `quantity${found.id}`);
          backorderForm.setFieldValue(`price${found.id}`, 0);
        }
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
      const searched = allProducts.filter((product) =>
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
      backorderForm.setFieldValue(`quantity${product.id}`, 0);
      backorderForm.setFieldValue(`price${product.id}`, 0);
      setSearch((prev) => ({ ...prev, products: [], query: "" }));
    }
  };

  const onRemoveProduct = (id) => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
    backorderForm.setFieldValue(`quantity${id}`, 0);
    backorderForm.setFieldValue(`price${id}`, 0);
    updatePrice(0, `remove${id}`);
    setSelectedProducts(
      selectedProducts.filter((product) => product.id !== id)
    );
  };

  const onClearQuery = () => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
  };

  return (
    <form onSubmit={backorderForm.handleSubmit}>
      {formState.page === 0 ? (
        <>
          {/* 1st page */}
          <div className="mb-5">
            <label className="custom-label mb-2 inline-block">
              <span>Order from customer</span>
              <span className="text-red-500">*</span>
            </label>
            <SelectSearch
              name="customer"
              form={backorderForm}
              field={"customerName"}
              options={customers.map((customer) => customer.name)}
              selected={backorderForm.values["customerName"]}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="expect" className="custom-label mb-2 inline-block">
              Expected delivery date
            </label>
            <DateInput
              id="expect"
              min="2022-01-01"
              max="2100-12-31"
              placeholder="Expected Delivery Date"
              name="expect"
              value={backorderForm.values[`expectedAt`]}
              onChange={(e) =>
                backorderForm.setFieldValue("expectedAt", e.target.value)
              }
            ></DateInput>
          </div>

          <div className="mb-5">
            <label
              htmlFor="employee"
              className="custom-label mb-2 inline-block"
            >
              Assign to
            </label>
            <SelectInput
              name="employee"
              form={backorderForm}
              field={"employeeName"}
              options={employees.map((employee) => employee.nickname)}
              selected={backorderForm.values["employeeName"]}
            ></SelectInput>
          </div>

          {backorderForm.values[`customerName`] && (
            <button
              type="button"
              className="btn-primary btn mt-3 w-full"
              onClick={onNextPage}
            >
              <span>Set product</span>
              <span>
                <BiRightArrowAlt className="ml-1 h-7 w-7"></BiRightArrowAlt>
              </span>
            </button>
          )}
        </>
      ) : (
        <>
          {formState.page === 1 && (
            <>
              <div className="mb-5">
                <SearchSuggest
                  query={search.query}
                  items={search.products}
                  onChange={(e) => onChangeSearch(e)}
                  onFocus={() =>
                    setSearch((prev) => ({
                      ...prev,
                      products: allProducts,
                      query: "",
                    }))
                  }
                  onSelect={onAddProduct}
                  onClear={onClearQuery}
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
                            {product.sell_price && (
                              <div className="custom-badge mt-1 bg-info text-info-content">
                                <span className="hidden sm:inline">
                                  Suggest:
                                </span>
                                <span>
                                  {" > "}${product.sell_price}
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            className="btn-accent btn-sm btn-circle btn"
                            onClick={() => onRemoveProduct(product.id)}
                          >
                            <span>
                              <BiX className="h-6 w-6"></BiX>
                            </span>
                          </button>
                        </div>
                        <div className="mb-2 grid grid-cols-12 gap-2">
                          <div className="col-span-6">
                            <label className="custom-label mb-2 inline-block">
                              Qty
                            </label>
                            <NumberInput
                              id={`quantity${product.id}`}
                              name={`quantity${product.id}`}
                              placeholder="Qty"
                              value={
                                backorderForm.values[`quantity${product.id}`]
                              }
                              onChange={(e) =>
                                handlePriceChange(e, `quantity${product.id}`)
                              }
                              min="0"
                              max="99999"
                              disabled={false}
                            ></NumberInput>
                          </div>
                          <div className="col-span-6">
                            <label className="custom-label mb-2 inline-block">
                              Unit
                            </label>
                            <SelectInput
                              form={backorderForm}
                              field={`unit${product.id}`}
                              name={`unit${product.id}`}
                              options={product.units.map(
                                (unit) => unit.code.split("_")[1]
                              )}
                              selected={
                                backorderForm.values[`unit${product.id}`]
                              }
                            ></SelectInput>
                          </div>
                          <div className="col-span-12">
                            <label className="custom-label mb-2 inline-block">
                              Unit Price
                            </label>
                            <TextInput
                              id={`price${product.id}`}
                              type="text"
                              name={`price${product.id}`}
                              placeholder="Price"
                              value={backorderForm.values[`price${product.id}`]}
                              onChange={(e) =>
                                handlePriceChange(e, `price${product.id}`)
                              }
                            ></TextInput>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 mb-2 flex justify-center">
                    <span>Empty.</span>
                  </div>
                )}
              </div>

              <div className="mt-3 mb-5 flex items-center">
                <div>
                  <span className="">Total price:</span>
                </div>
                <span className="ml-2 text-xl font-medium">${total}</span>
              </div>

              {edit && (
                <div className="mb-5 flex items-center">
                  <Checkbox
                    id="archived"
                    name="archived"
                    onChange={() =>
                      backorderForm.setFieldValue(
                        "isArchived",
                        !backorderForm.values["isArchived"]
                      )
                    }
                    checked={backorderForm.values["isArchived"]}
                    label="Convert to order"
                  ></Checkbox>
                </div>
              )}

              <div className="mb-5 flex items-center">
                <Checkbox
                  id="test"
                  name="test"
                  onChange={() =>
                    backorderForm.setFieldValue(
                      "isTest",
                      !backorderForm.values["isTest"]
                    )
                  }
                  checked={backorderForm.values["isTest"]}
                  label="Test"
                ></Checkbox>
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
                <button type="submit" className="btn-primary btn col-span-6">
                  <span>{edit ? "Update" : "Create"}</span>
                </button>
              </div>
            </>
          )}
        </>
      )}
      <button
        type="button"
        className="btn-accent btn mt-3 w-full"
        disabled={formState.loading}
        onClick={onClearForm}
      >
        <span>Clear change(s)</span>
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
  );
}
