import { useFormik } from "formik";
import { useState } from "react";
import api from "../../../../stores/api";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
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

function computeSelectedProducts(
  allProducts: Array<any>,
  existingProducts: Array<any>
) {
  const selected: Array<ISelectedProduct> = [];

  if (existingProducts.length >= 0) {
    // This function is used to load existing productVendorOrder and vendorTendency.
    // ...the former has product_name and the latter is name, so we need to convert one to another.
    existingProducts = existingProducts.map((po) => ({
      ...po,
      product_name: po.product_name ?? po.name,
    }));

    for (const product of allProducts) {
      const similarProductOrders = existingProducts.filter(
        (po) => po.product_name === product.name
      );
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

export default function VendorOrderForm({
  edit,
  vendors,
  allProducts,
  initialData,
  existingProducts,
  onClear,
}) {
  const navigate = useNavigate();
  const [page, setPage] = useState(edit ? 1 : 0);
  // The products we visually see in the form.
  const [selectedProducts, setSelectedProducts] = useState(() =>
    computeSelectedProducts(allProducts, existingProducts)
  );
  const [formState, setFormState] = useState<IFormState>({
    // Did we autofilled or templated? If in edit mode, neither will be ran.
    isFilled: edit,

    success: "",
    error: "",
  });

  const vendorOrderForm = useFormik({
    enableReinitialize: true,
    initialValues: initialData,
    onSubmit: async (data) => {
      setFormState((prev) => ({
        ...prev,
        error: "",
        success: "",
      }));
      try {
        let reqData = {};
        let productOrders = new Map();
        reqData["vendorName"] = data["vendorName"];
        reqData["status"] = data["status"];
        reqData["isTest"] = data["isTest"];
        reqData["expectedAt"] = data["expectedAt"];
        // Ensure this is either true-ish or null, no empty string allowed.
        // Makes it easier to deal with later.
        reqData["manualCode"] = data["manualCode"] ? data["manualCode"] : null;

        for (const product of selectedProducts) {
          productOrders.set(`${product.id}-${product.appear}`, {
            productName: product.name,
            unitPrice: product.price,
            quantity: product.quantity,
            unitCode: `${product.id}_${product.unit}`,
          });
        }
        reqData["productVendorOrders"] = [...productOrders.values()];
        reqData["attachment"] = data["attachment"];

        if (edit) {
          reqData["code"] = data["code"];
          const res = await api.putForm(
            `/vendor-orders/${reqData["code"]}`,
            reqData
          );
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
        const error = JSON.parse(
          JSON.stringify(e.response ? e.response.data.error : e)
        );
        setFormState((prev) => ({
          ...prev,
          error: error.message,
          success: "",
        }));

        if (error.status === 401) {
          handleTokenExpire(navigate, setFormState);
        }
      }
    },
  });

  const imageURL = useStateURL(vendorOrderForm.values.attachment);

  const markFormFilled = () => {
    setFormState((prev) => ({ ...prev, isFilled: true }));
  };

  const fillFormWithProducts = (products: Array<any>) => {
    setSelectedProducts(computeSelectedProducts(allProducts, products));
    markFormFilled();
  };

  const onClearForm = () => {
    if (edit) {
      onClear();
    } else {
      // Is there a better way to do this...
      vendorOrderForm.resetForm();
      setSelectedProducts([]);
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
    <form onSubmit={vendorOrderForm.handleSubmit}>
      {page === 0 ? (
        <VendorOrderFormPage0
          form={vendorOrderForm}
          onGoToPage1={onGoToPage1}
          fillFormWithProducts={fillFormWithProducts}
          setFormState={setFormState}
        />
      ) : page === 1 ? (
        <VendorOrderFormPage1
          form={vendorOrderForm}
          formState={formState}
          vendors={vendors}
          onClearForm={onClearForm}
          onGoToPage2={onGoToPage2}
          fillFormWithProducts={fillFormWithProducts}
        />
      ) : (
        <VendorOrderFormPage2
          form={vendorOrderForm}
          edit={edit}
          formState={formState}
          allProducts={allProducts}
          selectedProducts={selectedProducts}
          isInitiallyCompleted={initialData.status === "COMPLETED"}
          imageURL={imageURL}
          onClearForm={onClearForm}
          onPreviousPage={onGoToPage1}
          markFormFilled={markFormFilled}
          setFormState={setFormState}
          setSelectedProducts={setSelectedProducts}
        />
      )}
    </form>
  );
}
