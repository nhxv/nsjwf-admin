import { useFormik } from "formik";
import { useEffect, useMemo, useRef, useState } from "react";
import { BiCloudUpload } from "react-icons/bi";
import api from "../../../../stores/api";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import { useNavigate } from "react-router-dom";
import FileInput from "../../../../components/forms/FileInput";
import { useStateURL } from "../../../../commons/hooks/objecturl.hook";
import imageCompression from "browser-image-compression";
import { useQuery } from "@tanstack/react-query";
import VendorOrderFormPage1 from "./VendorOrderFormPage1";
import VendorOrderFormPage2 from "./VendorOrderFormPage2";
import { convertTime } from "../../../../commons/utils/time.util";

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

function computeSelectedProducts(
  allProducts: Array<any>,
  existingProducts: Array<any>
) {
  const selected: Array<ISelectedProduct> = [];

  if (existingProducts.length >= 0) {
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
            price: similarProductOrders[i].unit_price,
          });
        }
      }
    }
  }
  return selected;
}

export default function VendorOrderForm({
  edit,
  onClear,
  vendors,
  allProducts,
  initialData,
  existingProducts,
}) {
  const selected = useMemo(
    () => computeSelectedProducts(allProducts, existingProducts),
    [allProducts, existingProducts]
  );

  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    untouched: !edit,
    success: "",
    error: "",
  });
  const [page, setPage] = useState(edit ? 1 : 0);
  const [selectedProducts, setSelectedProducts] = useState(selected);

  const imageCompressAborter = useRef(new AbortController());

  const vendorOrderForm = useFormik({
    enableReinitialize: true,
    initialValues: { ...initialData },
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
            unitCode: product.unit,
          });
        }
        reqData["productVendorOrders"] = [...productOrders.values()];
        reqData["attachment"] = data["attachment"];

        console.log(reqData);
        return;

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

  const isAutofillEnabled =
    !edit && !!vendorOrderForm.values.attachment && formState.untouched;

  const autofillQuery = useQuery({
    queryKey: ["vendor-orders", "autofill"],
    queryFn: async () => {
      console.log("Requesting autofilling...");
      try {
        const result = await api.postForm(`/vendor-orders/autofill`, {
          attachment: vendorOrderForm.values.attachment,
        });
        return result.data;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    // We only want autofill when it's a brand new order.
    enabled: isAutofillEnabled,
    refetchOnWindowFocus: false,
  });

  const templateQuery = useQuery({
    queryKey: [
      "vendors",
      "active",
      "tendency",
      vendorOrderForm.values["vendorName"],
    ],
    queryFn: async () => {
      // Non-critical function, return an empty array if it fails
      // (like no tendency or initial load).
      try {
        const vendorName = vendorOrderForm.values["vendorName"];
        const result = await api.get(
          `/vendors/active/tendency/${encodeURIComponent(vendorName)}`
        );
        return result.data.vendorProductTendencies;
      } catch {
        return [];
      }
    },
    // Suppress the warning when vendorName is not yet available.
    enabled:
      !isAutofillEnabled && !edit && !!vendorOrderForm.values["vendorName"],
    refetchOnWindowFocus: false,
  });

  const [isCompressingImg, setIsCompressingImg] = useState(false);
  const isFormLoading =
    templateQuery.isFetching || vendorOrderForm.isSubmitting;

  const imageURL = useStateURL(vendorOrderForm.values.attachment);

  // FIXME: Ew. Anyway we can get rid of this useEffect somehow?
  useEffect(() => {
    if (autofillQuery.data) {
      console.log("Autofilling...");
      const info = autofillQuery.data;
      const vendor_name = info.vendor_name;
      const date_received = info.date_received;
      const products = info.products;

      vendorOrderForm.setFieldValue("vendorName", vendor_name);
      vendorOrderForm.setFieldValue(
        "expectedAt",
        convertTime(new Date(date_received))
      );

      const selected: Array<ISelectedProduct> = [];
      for (const product of allProducts) {
        const appear = 1;
        const found = products.find((p) => p.name === product.name);
        if (found) {
          selected.push({
            id: product.id,
            appear: appear,
            name: product.name,
            recent_cost: product.recent_cost,
            units: product.units,

            quantity: found.quantity,
            price: "0",
            unit: found.unit_code.split("_")[1],
          });
        }
      }
      setPage(0);
      setSelectedProducts(selected);
      setFormTouched();
    }
  }, [autofillQuery.data]);

  const onClearForm = () => {
    onClear();
    // setFormState((prev) => ({ ...prev, untouched: false }));
    // imageCompressAborter.current.abort();
  };

  const onGoToPage2 = async () => {
    if (!edit && selectedProducts.length === 0) {
      if (templateQuery.isSuccess && templateQuery.data.length > 0) {
        const template = templateQuery.data;
        const selected = [];
        const updatedPrices = [];
        for (const product of allProducts) {
          const appear = 1;
          const found = template.find((p) => p.name === product.name);
          if (found) {
            selected.push({
              id: product.id,
              appear: appear,
              name: product.name,
              recent_cost: product.recent_cost,
              units: product.units,
            });
            vendorOrderForm.setFieldValue(
              `quantity${product.id}-${appear}`,
              found.quantity
            );
            vendorOrderForm.setFieldValue(
              `unit${product.id}`,
              found.unit_code.split("_")[1]
            );
            vendorOrderForm.setFieldValue(`price${product.id}-${appear}`, "0");
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
        setSelectedProducts(selected);
        setFormState((prev) => ({ ...prev, untouched: false }));
      }
    }
    setPage(1);
  };

  const onGoToPage1 = () => {
    setPage(0);
  };

  const setFormTouched = () => {
    setFormState((prev) => ({ ...prev, untouched: false }));
  };

  return (
    <form onSubmit={vendorOrderForm.handleSubmit}>
      {page === 0 ? (
        <div className="w-full">
          <FileInput
            accept="image/*"
            handleFiles={async (files) => {
              const file = files[0];
              if (file.type.startsWith("image/")) {
                try {
                  const compressedFile = await imageCompression(file, {
                    maxSizeMB: 0.1,
                    maxWidthOrHeight: 768,
                    signal: imageCompressAborter.current.signal,
                    onProgress: (progress) => {
                      if (progress < 100) {
                        setIsCompressingImg(true);
                      } else {
                        setIsCompressingImg(false);
                      }
                    },
                  });
                  vendorOrderForm.setFieldValue("attachment", compressedFile);
                  vendorOrderForm.setFieldValue("attachmentExists", true);
                } catch (error) {
                  setFormState((prev) => ({
                    ...prev,
                    error: error.message,
                  }));
                  vendorOrderForm.setFieldValue("attachment", null);
                  vendorOrderForm.setFieldValue("attachmentExists", false);
                  setTimeout(() => {
                    setFormState((prev) => ({
                      ...prev,
                      error: "",
                    }));
                  }, 1500);
                }
              }
            }}
          >
            <span>
              <BiCloudUpload className="h-8 w-8"></BiCloudUpload>
            </span>
            <div>Drag and drop image here</div>
            <div>or click to browse</div>
            <div>!! This is an experimental feature !!</div>
          </FileInput>
          <button onClick={() => setPage(0)}>Skip experimental feature</button>
        </div>
      ) : page === 1 ? (
        <VendorOrderFormPage1
          form={vendorOrderForm}
          vendors={vendors}
          isFormLoading={isFormLoading}
          onNextPage={onGoToPage2}
          onClearForm={onClearForm}
        />
      ) : (
        <>
          {page === 2 && (
            <VendorOrderFormPage2
              form={vendorOrderForm}
              formState={formState}
              newAllProducts={allProducts}
              selectedProducts={selectedProducts}
              isCompressingImg={isCompressingImg}
              isFormLoading={isFormLoading}
              edit={edit}
              isCompleted={initialData.status === "COMPLETED"}
              imageURL={imageURL}
              setIsCompressingImg={setIsCompressingImg}
              onClearForm={onClearForm}
              onPreviousPage={onGoToPage1}
              setFormState={setFormState}
              setFormTouched={setFormTouched}
              setSelectedProducts={setSelectedProducts}
            />
          )}
        </>
      )}
    </form>
  );
}
