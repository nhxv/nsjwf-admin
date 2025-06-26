import { useFormik } from "formik";
import { useMemo, useRef, useState } from "react";
import {
  BiCloudUpload,
  BiImage,
  BiLeftArrowAlt,
  BiRightArrowAlt,
  BiX,
} from "react-icons/bi";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import Alert from "../../../../components/Alert";
import Spinner from "../../../../components/Spinner";
import Checkbox from "../../../../components/forms/Checkbox";
import DateInput from "../../../../components/forms/DateInput";
import NumberInput from "../../../../components/forms/NumberInput";
import SearchSuggest from "../../../../components/forms/SearchSuggest";
import SelectInput from "../../../../components/forms/SelectInput";
import SelectSearch from "../../../../components/forms/SelectSearch";
import TextInput from "../../../../components/forms/TextInput";
import api from "../../../../stores/api";
import { handleTokenExpire } from "../../../../commons/utils/token.util";
import { useNavigate } from "react-router-dom";
import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";
import FileInput from "../../../../components/forms/FileInput";
import ImageModal from "../../../../components/forms/ImageModal";
import { useStateURL } from "../../../../commons/hooks/objecturl.hook";
import imageCompression from "browser-image-compression";
import { useQuery } from "@tanstack/react-query";

export default function VendorOrderForm({
  edit,
  initialData,
  fetchData,
  vendors,
  editedProducts,
  allProducts,
  onClear,
}) {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    success: "",
    error: "",
  });
  const [page, setPage] = useState(0);
  // NOTE: This might not need to be a state. May change later.
  const [selectedProducts, setSelectedProducts] = useState(
    editedProducts ? editedProducts : []
  );

  const [search, setSearch] = useState("");
  const filteredProducts =
    search === ""
      ? allProducts
      : allProducts.filter((product) =>
          product.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(search.toLowerCase().replace(/\s+/g, ""))
        );

  const imageCompressAborter = useRef(new AbortController());

  const [imageModalIsOpen, setModalOpen] = useState(false);

  // NOTE: This might not need to be a state. May change later.
  const [fetchDataa, setFetchDataa] = useState(fetchData);

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
    enabled: !edit && !!vendorOrderForm.values["vendorName"],
    refetchOnWindowFocus: false,
  });

  const [isCompressingImg, setIsCompressingImg] = useState(false);
  const isFormLoading =
    templateQuery.isFetching || vendorOrderForm.isSubmitting;

  const imageURL = useStateURL(vendorOrderForm.values.attachment);

  const total = useMemo(() => {
    if (fetchDataa.prices?.length > 0) {
      return niceVisualDecimal(
        +fetchDataa.prices.reduce(
          (prev, current) => prev + current.quantity * current.price,
          0
        )
      );
    } else return 0;
  }, [fetchDataa.prices]);

  const updatePrice = (value: number, inputId: string) => {
    let updatedPrices = [...fetchDataa.prices];
    if (inputId.includes("quantity")) {
      const [id, appear] = inputId.replace("quantity", "").split("-");
      const index = updatedPrices.findIndex(
        (p) => p.id === +id && p.appear === +appear
      );
      updatedPrices[index].quantity = value;
    } else if (inputId.includes("price")) {
      const [id, appear] = inputId.replace("price", "").split("-");
      const index = updatedPrices.findIndex(
        (p) => p.id === +id && p.appear === +appear
      );
      updatedPrices[index].price = value;
    } else if (inputId.includes("remove")) {
      const [id, appear] = inputId.replace("remove", "").split("-");
      const index = updatedPrices.findIndex(
        (p) => p.id === +id && p.appear === +appear
      );
      updatedPrices[index].quantity = 0;
      updatedPrices[index].price = 0;
    }
    setFetchDataa((prev) => ({ ...prev, prices: updatedPrices }));
  };

  const handlePriceChange = (e, inputId: string) => {
    vendorOrderForm.setFieldValue(inputId, e.target.value);
    updatePrice(+e.target.value, inputId);
  };

  const onClearForm = () => {
    onClear();
    imageCompressAborter.current.abort();
  };

  const onNextPage = async () => {
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
        setFetchDataa((prev) => ({ ...prev, prices: updatedPrices }));
        setSelectedProducts(selected);
      }
    }
    setPage(1);
  };

  const onPreviousPage = () => {
    setPage(0);
  };

  const onChangeSearch = (e) => {
    setSearch(e.target.value);
  };

  const onAddProduct = (product) => {
    setSearch("");
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
    vendorOrderForm.setFieldValue(`quantity${product.id}-${appear}`, 0);
    vendorOrderForm.setFieldValue(`price${product.id}-${appear}`, "0");
  };

  const onRemoveProduct = (id, appear) => {
    setSearch("");
    vendorOrderForm.setFieldValue(`quantity${id}-${appear}`, 0);
    vendorOrderForm.setFieldValue(`unit${id}-${appear}`, "BOX");
    vendorOrderForm.setFieldValue(`price${id}-${appear}`, "0");
    updatePrice(0, `remove${id}-${appear}`);
    setSelectedProducts(
      selectedProducts.filter(
        (product) => product.id !== id || product.appear !== appear
      )
    );
  };

  const onClearQuery = () => {
    setSearch("");
  };

  return (
    <form onSubmit={vendorOrderForm.handleSubmit}>
      {page === 0 ? (
        <div className="custom-card mx-auto grid grid-cols-12 gap-x-2 xl:w-7/12">
          {/* 1st page */}
          <div className="col-span-12 mb-5 xl:col-span-6">
            <label className="custom-label mb-2 inline-block">
              <span>Order to vendor</span>
              <span className="text-red-500">*</span>
            </label>
            <SelectSearch
              name="vendor"
              value={vendorOrderForm.values["vendorName"]}
              setValue={(v) => vendorOrderForm.setFieldValue("vendorName", v)}
              options={vendors.map((vendor) => vendor.name)}
            />
          </div>

          <div className="col-span-12 mb-5 xl:col-span-6">
            <label className="custom-label mb-2 inline-block">
              <span>Manual code</span>
            </label>
            <TextInput
              id="manual-code"
              type="text"
              placeholder={`Manual code`}
              name="manualCode"
              value={vendorOrderForm.values.manualCode}
              onChange={vendorOrderForm.handleChange}
            ></TextInput>
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
              value={vendorOrderForm.values[`expectedAt`]}
              onChange={(e) =>
                vendorOrderForm.setFieldValue("expectedAt", e.target.value)
              }
            ></DateInput>
          </div>

          <div className="col-span-12 mb-5 xl:col-span-6">
            <label htmlFor="status" className="custom-label mb-2 inline-block">
              Status
            </label>
            <SelectInput
              name="status"
              value={vendorOrderForm.values["status"]}
              setValue={(v) => vendorOrderForm.setFieldValue("status", v)}
              options={Object.values(OrderStatus).filter(
                (status) =>
                  status !== OrderStatus.PICKING &&
                  status !== OrderStatus.SHIPPING &&
                  status !== OrderStatus.CANCELED &&
                  // status !== OrderStatus.COMPLETED
                  status !== OrderStatus.DELIVERED
              )}
            ></SelectInput>
          </div>

          {vendorOrderForm.values[`vendorName`] && (
            <button
              type="button"
              className="btn btn-primary col-span-12 mt-3"
              onClick={onNextPage}
              disabled={isFormLoading}
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
            <span>Clear change(s)</span>
          </button>
        </div>
      ) : (
        <>
          {page === 1 && (
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

                <div className="my-5 flex items-center">
                  <Checkbox
                    id="test"
                    name="test"
                    label="Test"
                    onChange={() =>
                      vendorOrderForm.setFieldValue(
                        "isTest",
                        !vendorOrderForm.values["isTest"]
                      )
                    }
                    checked={vendorOrderForm.values["isTest"]}
                  ></Checkbox>
                </div>

                <div className="my-5 flex justify-between gap-2">
                  {imageURL ? (
                    <div
                      className="custom-card sticker-primary relative w-full text-center hover:cursor-pointer dark:border-2"
                      onClick={() => {
                        setModalOpen(true);
                      }}
                    >
                      <ImageModal
                        isOpen={imageModalIsOpen}
                        onClose={() => setModalOpen(false)}
                        imageSrc={imageURL}
                      />
                      <button
                        type="button"
                        className="btn btn-circle btn-accent btn-sm absolute -right-4 -top-4 shadow-md"
                        onClick={(e) => {
                          e.stopPropagation(); // Stop propagation to div

                          vendorOrderForm.setFieldValue("attachment", null);
                          vendorOrderForm.setFieldValue(
                            "attachmentExists",
                            false
                          );
                        }}
                      >
                        <span>
                          <BiX className="h-6 w-6"></BiX>
                        </span>
                      </button>
                      <div className="hover:text-primary hover:underline">
                        <span className="flex justify-center">
                          <BiImage className="h-16 w-16"></BiImage>
                        </span>
                        <span>Click to view attachment</span>
                      </div>
                    </div>
                  ) : vendorOrderForm.values.attachmentExists ||
                    isCompressingImg ? (
                    <div className="custom-card sticker-primary relative w-full text-center dark:border-2">
                      {isCompressingImg && (
                        <button
                          type="button"
                          className="btn btn-circle btn-accent btn-sm absolute -right-4 -top-4 shadow-md"
                          onClick={(e) => {
                            e.stopPropagation(); // Stop propagation to div

                            imageCompressAborter.current.abort();
                            imageCompressAborter.current =
                              new AbortController();
                            setIsCompressingImg(false);
                          }}
                        >
                          <span>
                            <BiX className="h-6 w-6"></BiX>
                          </span>
                        </button>
                      )}
                      <Spinner />
                    </div>
                  ) : (
                    <div className="w-full">
                      <FileInput
                        accept="image/*"
                        handleFiles={async (files) => {
                          const file = files[0];
                          if (file.type.startsWith("image/")) {
                            try {
                              const compressedFile = await imageCompression(
                                file,
                                {
                                  maxSizeMB: 0.1,
                                  signal: imageCompressAborter.current.signal,
                                  onProgress: (progress) => {
                                    if (progress < 100) {
                                      setIsCompressingImg(true);
                                    } else {
                                      setIsCompressingImg(false);
                                    }
                                  },
                                }
                              );
                              vendorOrderForm.setFieldValue(
                                "attachment",
                                compressedFile
                              );
                              vendorOrderForm.setFieldValue(
                                "attachmentExists",
                                true
                              );
                            } catch (error) {
                              setFormState((prev) => ({
                                ...prev,
                                error: error.message,
                              }));
                              vendorOrderForm.setFieldValue("attachment", null);
                              vendorOrderForm.setFieldValue(
                                "attachmentExists",
                                false
                              );
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
                      </FileInput>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <button
                    type="button"
                    className="btn-outline-primary btn col-span-6"
                    onClick={onPreviousPage}
                    disabled={isFormLoading}
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
                      isFormLoading ||
                      (vendorOrderForm.values.attachmentExists && !imageURL)
                    }
                  >
                    <span>{edit ? "Update" : "Create"}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-accent col-span-12"
                    onClick={onClearForm}
                  >
                    <span>Revert change(s)</span>
                  </button>
                </div>

                <div>
                  {isFormLoading && (
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
                    query={search}
                    items={filteredProducts}
                    onChange={(e) => onChangeSearch(e)}
                    onFocus={() => setSearch("")}
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
                            <div className="custom-badge mt-1 bg-accent text-accent-content">
                              <span>Product</span>
                            </div>
                          </div>
                          <div className="col-span-6 xl:col-span-2">
                            <label className="custom-label mb-2 inline-block">
                              Qty
                            </label>
                            <NumberInput
                              id={`quantity${product.id}-${product.appear}`}
                              placeholder="Qty"
                              name={`quantity${product.id}-${product.appear}`}
                              value={
                                vendorOrderForm.values[
                                  `quantity${product.id}-${product.appear}`
                                ]
                              }
                              onChange={(e) =>
                                handlePriceChange(
                                  e,
                                  `quantity${product.id}-${product.appear}`
                                )
                              }
                            ></NumberInput>
                          </div>
                          <div className="col-span-6 xl:col-span-2">
                            <label className="custom-label mb-2 inline-block">
                              Unit Price
                            </label>
                            <TextInput
                              id={`price${product.id}-${product.appear}`}
                              placeholder="Price"
                              name={`price${product.id}-${product.appear}`}
                              value={
                                vendorOrderForm.values[
                                  `price${product.id}-${product.appear}`
                                ]
                              }
                              onChange={(e) =>
                                handlePriceChange(
                                  e,
                                  `price${product.id}-${product.appear}`
                                )
                              }
                            ></TextInput>
                          </div>
                          <div className="col-span-6 xl:col-span-2">
                            <label className="custom-label mb-2 inline-block">
                              Unit
                            </label>
                            <SelectInput
                              name={`unit${product.id}-${product.appear}`}
                              value={
                                vendorOrderForm.values[
                                  `unit${product.id}-${product.appear}`
                                ]
                              }
                              setValue={(v) =>
                                vendorOrderForm.setFieldValue(
                                  `unit${product.id}-${product.appear}`,
                                  v
                                )
                              }
                              options={product.units.map(
                                (unit) => unit.code.split("_")[1]
                              )}
                            ></SelectInput>
                          </div>
                          <div className="col-span-6 xl:col-span-2">
                            <div className="custom-label mb-2">Amount</div>
                            <div className="rounded-box flex h-12 items-center bg-base-300 px-3">
                              {
                                // Display amount to be more explicit for user.
                                vendorOrderForm.values[
                                  `price${product.id}-${product.appear}`
                                ] === ""
                                  ? 0
                                  : niceVisualDecimal(
                                      parseFloat(
                                        (
                                          vendorOrderForm.values[
                                            `quantity${product.id}-${product.appear}`
                                          ] *
                                          vendorOrderForm.values[
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
