import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useMemo, useState } from "react";
import api, { getApiError } from "../../../../stores/api";
import { useNavigate } from "react-router-dom";
import { useStateURL } from "../../../../commons/hooks/objecturl.hook";
import VendorOrderFormPage0 from "./VendorOrderFormPage0";
import VendorOrderFormPage1 from "./VendorOrderFormPage1";
import VendorOrderFormPage2 from "./VendorOrderFormPage2";

export interface ISelectedProduct {
  id: string;
  appear: number;
  name: string;
  units: Array<any>;
  quantity: number;
  price: string;
  unit: string;

  recent_cost?: any;
}

export interface IFormState {
  isFilled: boolean;
  success: string;
  error: string;
}

interface IVendorOrderFormFields {
  vendorName: string;
  status: string;
  isTest: boolean;
  expectedAt: string;
  manualCode: string;
  code?: string;
  attachment: any;
  isAttachmentExist?: boolean;
  products: Array<ISelectedProduct>;
}

function computeSelectedProducts(allProducts: Array<any>, existingProducts: Array<any>) {
  const selected: Array<ISelectedProduct> = [];

  if (existingProducts.length >= 0) {
    // This function is used to load existing productVendorOrder and vendorTendency.
    // ...the former has product_name and the latter is name, so we need to convert one to another.
    existingProducts = existingProducts.map((po) => ({
      ...po,
      product_name: po.product_name ?? po.name,
    }));

    for (const product of allProducts) {
      const similarProductOrders = existingProducts.filter((po) => po.product_name === product.name);
      if (similarProductOrders.length > 0) {
        for (let i = 0; i < similarProductOrders.length; i++) {
          // similar products in existing order
          let appear = i + 1;
          selected.push({
            id: product.id,
            appear: appear,
            name: product.name,
            units: product.units,
            recent_cost: product.recent_cost,

            quantity: similarProductOrders[i].quantity,
            unit: similarProductOrders[i].unit_code.split("_")[1],
            price: similarProductOrders[i].unit_price ?? "0",
          });
        }
      }
    }
  }
  return selected;
}

export default function VendorOrderForm({ edit, vendors, allProducts, initialData, existingProducts, onClear }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(edit ? 1 : 1);
  const [formState, setFormState] = useState<IFormState>({
    // Did we autofilled or templated? If in edit mode, neither will be ran.
    isFilled: edit,

    success: "",
    error: "",
  });

  // Only recomputed when the underlying query data actually changes, so this
  // doesn't reset the form (and the field array) on every keystroke.
  const formValues = useMemo(
    () => ({
      ...initialData,
      products: computeSelectedProducts(allProducts, existingProducts),
    }),
    [initialData, allProducts, existingProducts],
  );

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<IVendorOrderFormFields>({
    values: formValues,
  });

  // `rowKey` (not `id`) to avoid colliding with each product's own `id`.
  const { fields, prepend, remove, replace } = useFieldArray({
    control,
    name: "products",
    keyName: "rowKey",
  });

  const attachment = useWatch({ control, name: "attachment" });

  const onSubmit = async (data: IVendorOrderFormFields) => {
    setFormState((prev) => ({
      ...prev,
      error: "",
      success: "",
    }));
    try {
      let reqData = {};
      reqData["vendorName"] = data["vendorName"];
      reqData["status"] = data["status"];
      reqData["isTest"] = data["isTest"];
      reqData["expectedAt"] = data["expectedAt"];
      // Ensure this is either true-ish or null, no empty string allowed.
      // Makes it easier to deal with later.
      reqData["manualCode"] = data["manualCode"] ? data["manualCode"] : null;

      reqData["productVendorOrders"] = data.products.map((product) => ({
        productName: product.name,
        unitPrice: product.price,
        quantity: product.quantity,
        unitCode: `${product.id}_${product.unit}`,
      }));
      reqData["attachment"] = data["attachment"];

      if (edit) {
        reqData["code"] = data["code"];
        const res = await api.putForm(`/vendor-orders/${reqData["code"]}`, reqData);
        if (res) {
          navigate(`/vendor/view-vendor-order`);
        }
      } else {
        // create order
        const res = await api.postForm(`/vendor-orders`, reqData);
        if (res) {
          navigate(`/vendor/view-vendor-order`);
        }
      }
    } catch (e) {
      const error = getApiError(e);
      setFormState((prev) => ({
        ...prev,
        error: error.message,
        success: "",
      }));
    }
  };

  const imageURL = useStateURL(attachment);

  const markFormFilled = () => {
    setFormState((prev) => ({ ...prev, isFilled: true }));
  };

  const fillFormWithProducts = (products: Array<any>) => {
    replace(computeSelectedProducts(allProducts, products));
    markFormFilled();
  };

  const onClearForm = () => {
    if (edit) {
      onClear();
    } else {
      // Is there a better way to do this...
      reset();
      replace([]);
      setPage(0);
      setFormState((prev) => ({ ...prev, isFilled: false }));
    }
  };

  const onGoToPage2 = () => {
    setPage(2);
  };

  const onGoToPage1 = () => {
    setPage(1);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {page === 0 ? (
        <VendorOrderFormPage0
          control={control}
          setValue={setValue}
          onGoToPage1={onGoToPage1}
          fillFormWithProducts={fillFormWithProducts}
          setFormState={setFormState}
        />
      ) : page === 1 ? (
        <VendorOrderFormPage1
          control={control}
          setValue={setValue}
          formState={formState}
          vendors={vendors}
          onClearForm={onClearForm}
          onGoToPage2={onGoToPage2}
          fillFormWithProducts={fillFormWithProducts}
        />
      ) : (
        <VendorOrderFormPage2
          control={control}
          setValue={setValue}
          isSubmitting={isSubmitting}
          edit={edit}
          formState={formState}
          allProducts={allProducts}
          fields={fields}
          prepend={prepend}
          remove={remove}
          replace={replace}
          isInitiallyCompleted={initialData.status === "COMPLETED"}
          imageURL={imageURL}
          onClearForm={onClearForm}
          onPreviousPage={onGoToPage1}
          markFormFilled={markFormFilled}
          setFormState={setFormState}
        />
      )}
    </form>
  );
}
