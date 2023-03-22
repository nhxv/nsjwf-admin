import { useFormik } from "formik";
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

  const [selectedProducts, setSelectedProducts] = useState(
    editedProducts ? editedProducts : []
  );
  const [search, setSearch] = useState({
    products: [],
    query: "",
  });

  const customerOrderForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
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
        reqData["productCustomerOrders"] = [...productOrders.values()];
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
      }
    },
  });

  const handlePriceChange = (e, inputId: string) => {
    customerOrderForm.setFieldValue(inputId, e.target.value);
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
      const template = await loadTemplate(
        customerOrderForm.values[`customerName`]
      );
      if (template) {
        const selected = [];
        const updatedPrices = [];
        for (const product of allProducts) {
          const found = template.find((p) => p.name === product.name);
          if (found) {
            selected.push({
              id: product.id,
              name: product.name,
              sell_price: product.sell_price,
              units: product.units,
            });
            customerOrderForm.setFieldValue(
              `quantity${product.id}`,
              found.quantity
            );
            customerOrderForm.setFieldValue(
              `unit${product.id}`,
              found.unit_code.split("_")[1]
            );
            customerOrderForm.setFieldValue(`price${product.id}`, 0);
            updatedPrices.push({
              id: product.id,
              quantity: found.quantity,
              price: 0,
            });
          } else {
            updatedPrices.push({
              id: product.id,
              quantity: 0,
              price: 0,
            });
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
      customerOrderForm.setFieldValue(`quantity${product.id}`, 0);
      customerOrderForm.setFieldValue(`price${product.id}`, 0);
    }
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
  };

  const onRemoveProduct = (id) => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
    customerOrderForm.setFieldValue(`quantity${id}`, 0);
    customerOrderForm.setFieldValue(`unit${id}`, "BOX");
    customerOrderForm.setFieldValue(`price${id}`, 0);
    updatePrice(0, `remove${id}`);
    setSelectedProducts(
      selectedProducts.filter((product) => product.id !== id)
    );
  };

  const onClearQuery = () => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
  };

  return (
    <form onSubmit={customerOrderForm.handleSubmit}>
      {formState.page === 0 ? (
        <div className="custom-card mx-auto grid grid-cols-12 gap-x-2 xl:w-7/12">
          {/* 1st page */}
          <div className="col-span-12 mb-5 xl:col-span-6">
            <label className="custom-label mb-2 inline-block">
              <span>Manual code</span>
            </label>
            <TextInput
              id="manual-code"
              type="text"
              placeholder={`Manual code`}
              name="manualCode"
              value={customerOrderForm.values.manualCode}
              onChange={customerOrderForm.handleChange}
            ></TextInput>
          </div>

          <div className="col-span-12 mb-5 xl:col-span-6">
            <label className="custom-label mb-2 inline-block">
              <span>Order from customer</span>
              <span className="text-red-500">*</span>
            </label>
            <SelectSearch
              form={customerOrderForm}
              field={"customerName"}
              name="customer"
              options={customers.map((customer) => customer.name)}
              selected={customerOrderForm.values["customerName"]}
            />
          </div>

          <div className="col-span-12 mb-5 xl:col-span-6">
            <label htmlFor="expect" className="custom-label mb-2 inline-block">
              Expected delivery date
            </label>
            <DateInput
              id="expect"
              min="2023-01-01"
              max="2100-12-31"
              placeholder="Expected Delivery Date"
              name="expectedAt"
              value={customerOrderForm.values[`expectedAt`]}
              onChange={(e) =>
                customerOrderForm.setFieldValue("expectedAt", e.target.value)
              }
            ></DateInput>
          </div>

          <div className="col-span-12 mb-5 xl:col-span-3">
            <label
              htmlFor="employee"
              className="custom-label mb-2 inline-block"
            >
              Assign to
            </label>
            <SelectInput
              form={customerOrderForm}
              field={"employeeName"}
              name="employeeName"
              options={employees.map((employee) => employee.nickname)}
              selected={customerOrderForm.values["employeeName"]}
            ></SelectInput>
          </div>

          <div className="col-span-12 mb-5 xl:col-span-3">
            <label htmlFor="status" className="custom-label mb-2 inline-block">
              Status
            </label>
            <SelectInput
              form={customerOrderForm}
              field={"status"}
              name="status"
              options={Object.values(OrderStatus).filter(
                (status) => status !== OrderStatus.CANCELED
              )}
              selected={customerOrderForm.values["status"]}
            ></SelectInput>
          </div>

          {customerOrderForm.values[`customerName`] && (
            <button
              type="button"
              className="btn-primary btn col-span-12 mt-3"
              onClick={onNextPage}
            >
              <span>Set product</span>
              <span>
                <BiRightArrowAlt className="ml-1 h-7 w-7"></BiRightArrowAlt>
              </span>
            </button>
          )}
          <button
            type="button"
            className="btn-accent btn col-span-12 mt-3"
            onClick={onClearForm}
          >
            <span>Clear change(s)</span>
          </button>
        </div>
      ) : (
        <>
          {formState.page === 1 && (
            <div className="flex flex-col items-start gap-6 xl:flex-row-reverse">
              <div className="custom-card w-full xl:w-5/12">
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

                <div className="mt-3 mb-4 flex items-center">
                  <span className="">Total price:</span>
                  <span className="ml-2 text-xl font-medium">${total}</span>
                </div>

                <div className="mb-5 flex items-center">
                  <Checkbox
                    id="test"
                    name="test"
                    label="Test"
                    onChange={() =>
                      customerOrderForm.setFieldValue(
                        "isTest",
                        !customerOrderForm.values["isTest"]
                      )
                    }
                    checked={customerOrderForm.values["isTest"]}
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
                  <button
                    type="submit"
                    className="btn-primary btn col-span-6"
                    disabled={formState.loading}
                  >
                    <span>{edit ? "Update" : "Create"}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-accent btn col-span-12"
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
                {selectedProducts && selectedProducts.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="custom-card relative w-full p-3"
                      >
                        <button
                          type="button"
                          className="btn-accent btn-sm btn-circle btn absolute -top-4 -right-4 shadow-md"
                          onClick={() => onRemoveProduct(product.id)}
                        >
                          <span>
                            <BiX className="h-6 w-6"></BiX>
                          </span>
                        </button>
                        <div className="mb-2 grid grid-cols-12 items-center gap-2">
                          <div className="col-span-12 xl:col-span-4">
                            <span className="text-lg font-semibold">
                              {product.name}
                            </span>
                            {product.sell_price ? (
                              <div className="custom-badge mt-1 bg-info text-info-content">
                                <span className="hidden sm:inline">
                                  Suggest:
                                </span>
                                <span>
                                  {" > "}${product.sell_price}
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
                            <NumberInput
                              id={`quantity${product.id}`}
                              name={`quantity${product.id}`}
                              placeholder="Qty"
                              value={
                                customerOrderForm.values[
                                  `quantity${product.id}`
                                ]
                              }
                              onChange={(e) =>
                                handlePriceChange(e, `quantity${product.id}`)
                              }
                              min="0"
                              max="99999"
                              disabled={false}
                            ></NumberInput>
                          </div>
                          <div className="col-span-6 xl:col-span-2">
                            <label className="custom-label mb-2 inline-block">
                              Unit
                            </label>
                            <SelectInput
                              form={customerOrderForm}
                              field={`unit${product.id}`}
                              name={`unit${product.id}`}
                              options={product.units.map(
                                (unit) => unit.code.split("_")[1]
                              )}
                              selected={
                                customerOrderForm.values[`unit${product.id}`]
                              }
                            ></SelectInput>
                          </div>
                          <div className="col-span-6 xl:col-span-2">
                            <label className="custom-label mb-2 inline-block">
                              Unit Price
                            </label>
                            <TextInput
                              id={`price${product.id}`}
                              type="text"
                              name={`price${product.id}`}
                              placeholder="Price"
                              value={
                                customerOrderForm.values[`price${product.id}`]
                              }
                              onChange={(e) =>
                                handlePriceChange(e, `price${product.id}`)
                              }
                            ></TextInput>
                          </div>
                          <div className="col-span-6 xl:col-span-2">
                            <div className="custom-label mb-2">Amount</div>
                            <div className="rounded-box flex h-12 items-center bg-base-300 px-3">
                              {customerOrderForm.values[
                                `quantity${product.id}`
                              ] *
                                customerOrderForm.values[`price${product.id}`]}
                            </div>
                          </div>
                        </div>
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
