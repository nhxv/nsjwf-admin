import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useMemo, useState } from "react";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import Alert from "../../../../components/Alert";
import Checkbox from "../../../../components/forms/Checkbox";
import DateInput from "../../../../components/forms/DateInput";
import SearchSuggest from "../../../../components/forms/SearchSuggest";
import SelectInput from "../../../../components/forms/SelectInput";
import SelectSearch from "../../../../components/forms/SelectSearch";
import TextInput from "../../../../components/forms/TextInput";
import Spinner from "../../../../components/Spinner";
import api from "../../../../stores/api";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import CustomerOrderProductRow from "./CustomerOrderProductRow";
import CustomerOrderTotal from "./CustomerOrderTotal";

interface ICustomerOrderProduct {
  id: number;
  appear: number;
  name: string;
  units: Array<any>;
  recent_cost?: any;
  quantity: number;
  price: string | number;
  unit: string;
}

interface ICustomerOrderFormFields {
  customerName: string;
  employeeName: string;
  status: string;
  isTest: boolean;
  code?: string;
  manualCode: string;
  note: string;
  expectedAt: string;
  products: Array<ICustomerOrderProduct>;
}

export default function CustomerOrderForm({ edit, initialData, customers, editedProducts, allProducts, employees, loadTemplate, onClear }) {
  const [formState, setFormState] = useState({
    success: "",
    error: "",
    loading: false,
    page: 0,
  });

  const navigate = useNavigate();

  const [availableProducts, _] = useState(allProducts.filter((product) => !product.discontinued));
  const [search, setSearch] = useState({
    products: [],
    query: "",
  });

  // Only recomputed when the underlying fetched data actually changes, so
  // this doesn't reset the form (and the field array) on every keystroke.
  const formValues = useMemo(
    () => ({
      ...initialData,
      products: editedProducts ?? [],
    }),
    [initialData, editedProducts],
  );

  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useForm<ICustomerOrderFormFields>({
    values: formValues,
  });

  // `rowKey` (not `id`) to avoid colliding with each product's own `id`.
  const { fields, prepend, remove, replace } = useFieldArray({
    control,
    name: "products",
    keyName: "rowKey",
  });

  const customerName = useWatch({ control, name: "customerName" });

  const onSubmit = async (data: ICustomerOrderFormFields) => {
    setFormState((prev) => ({
      ...prev,
      error: "",
      empty: "",
      loading: true,
    }));
    try {
      let reqData = {};
      reqData["customerName"] = data["customerName"];
      reqData["assignTo"] = data["employeeName"];
      reqData["status"] = data["status"];
      reqData["isTest"] = data["isTest"];
      reqData["manualCode"] = data["manualCode"];
      reqData["expectedAt"] = data["expectedAt"];
      reqData["note"] = data["note"] ? data["note"] : ""; // Just to make sure it's str
      reqData["productCustomerOrders"] = data.products.map((product) => ({
        productName: product.name,
        // Allow price to be empty.
        unitPrice: product.price ? product.price : "",
        quantity: product.quantity,
        unitCode: `${product.id}_${product.unit}`,
      }));
      setFormState((prev) => ({
        ...prev,
        error: "",
        empty: "",
        loading: false,
      }));
      if (edit) {
        // edit order
        reqData["code"] = data["code"];
        const res = await api.put(`/customer-orders/${reqData["code"]}`, reqData);
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

  const onNextPage = async () => {
    if (!edit && fields.length === 0) {
      setFormState((prev) => ({
        ...prev,
        error: "",
        empty: "",
        loading: true,
      }));
      const template = await loadTemplate(getValues("customerName"));
      if (template) {
        const newProducts: Array<ICustomerOrderProduct> = [];
        // NOTE: For now, we keep this at allProducts because updating discontinued product is a bit confusing right now.
        for (const product of allProducts) {
          const appear = 1;
          const found = template.find((p) => p.name === product.name);
          if (found) {
            // template only allows product to appear once -> if found, appear = 1
            newProducts.push({
              id: product.id,
              appear: appear,
              name: product.name,
              recent_cost: product.recent_cost,
              units: product.units,
              quantity: found.quantity,
              unit: found.unit_code.split("_")[1],
              price: 0,
            });
          }
        }
        replace(newProducts);
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
        product.name.toLowerCase().replace(/\s+/g, "").includes(e.target.value.toLowerCase().replace(/\s+/g, "")),
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

  const toRow = (f: ICustomerOrderProduct & { rowKey?: string }): ICustomerOrderProduct => ({
    id: f.id,
    appear: f.appear,
    name: f.name,
    units: f.units,
    recent_cost: f.recent_cost,
    quantity: f.quantity,
    price: f.price,
    unit: f.unit,
  });

  const onAddProduct = (product) => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
    const found = fields.filter((f) => f.name === product.name);
    if (found.length >= product.units.length) {
      // cannot add more of this product, but we'll bump them up the list for searching purpose
      replace([...found.map(toRow), ...fields.filter((f) => f.name !== product.name).map(toRow)]);
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
    prepend({
      id: product.id,
      appear: appear,
      name: product.name,
      units: product.units,
      recent_cost: product.recent_cost,
      quantity: 0,
      // Can't set to 0 to prevent user forgetting a field.
      price: "",
      unit: "BOX",
    });
  };

  const onRemoveProduct = (index: number) => {
    setSearch((prev) => ({ ...prev, products: [], query: "" }));
    remove(index);
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
                <SelectSearch name="customer" value={field.value} setValue={field.onChange} options={customers.map((customer) => customer.name)} />
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
                <TextInput id="manual-code" type="text" placeholder={`Manual code`} name={field.name} value={field.value} onChange={field.onChange}></TextInput>
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
                  onChange={field.onChange}></DateInput>
              )}
            />
          </div>

          <div className="col-span-12 mb-5 xl:col-span-3">
            <label htmlFor="employee" className="custom-label mb-2 inline-block">
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
                  options={employees.map((employee) => employee.nickname)}></SelectInput>
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
                  options={Object.values(OrderStatus).filter((status) => status !== OrderStatus.CANCELED)}></SelectInput>
              )}
            />
          </div>

          {customerName && (
            <button type="button" className="btn btn-primary col-span-12 mt-3" onClick={onNextPage} disabled={formState.loading || isSubmitting}>
              <span>Set product</span>
              <span>
                <BiRightArrowAlt className="ml-1 h-7 w-7"></BiRightArrowAlt>
              </span>
            </button>
          )}
          <button type="button" className="btn btn-accent col-span-12 mt-3" onClick={onClearForm}>
            <span>Revert change(s)</span>
          </button>
        </div>
      ) : (
        <>
          {formState.page === 1 && (
            <div className="flex min-h-screen flex-col items-start gap-6 xl:flex-row-reverse">
              <div className="custom-card w-full xl:sticky xl:top-[84px] xl:w-5/12">
                <CustomerOrderTotal control={control} />

                <div className="my-5">
                  <Controller
                    name="note"
                    control={control}
                    render={({ field }) => <TextInput id="note" name={field.name} placeholder="Remarks" value={field.value} onChange={field.onChange} />}
                  />
                </div>

                <div className="my-5 flex items-center">
                  <Controller
                    name="isTest"
                    control={control}
                    render={({ field }) => (
                      <Checkbox id="test" name={field.name} label="Test" onChange={() => field.onChange(!field.value)} checked={field.value}></Checkbox>
                    )}
                  />
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <button type="button" className="btn-outline-primary btn col-span-6" onClick={onPreviousPage}>
                    <span>
                      <BiLeftArrowAlt className="mr-1 h-7 w-7"></BiLeftArrowAlt>
                    </span>
                    <span>Go back</span>
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary col-span-6"
                    disabled={initialData.status === "COMPLETED" || formState.loading || isSubmitting}>
                    <span>{edit ? "Update" : "Create"}</span>
                  </button>

                  <button type="button" className="btn btn-accent col-span-12" onClick={onClearForm}>
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
                    onClear={onClearQuery}></SearchSuggest>
                </div>

                {fields && fields.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {fields.map((field, index) => (
                      <CustomerOrderProductRow
                        key={field.rowKey}
                        control={control}
                        index={index}
                        name={field.name}
                        units={field.units}
                        recentCost={field.recent_cost}
                        onRemove={() => onRemoveProduct(index)}
                      />
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
