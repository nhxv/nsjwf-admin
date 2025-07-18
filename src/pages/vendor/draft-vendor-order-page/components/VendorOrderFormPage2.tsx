import { BiCloudUpload, BiImage, BiLeftArrowAlt, BiX } from "react-icons/bi";
import Checkbox from "../../../../components/forms/Checkbox";
import ImageModal from "../../../../components/forms/ImageModal";
import Spinner from "../../../../components/Spinner";
import FileInput from "../../../../components/forms/FileInput";
import imageCompression from "browser-image-compression";
import Alert from "../../../../components/Alert";
import SearchSuggest from "../../../../components/forms/SearchSuggest";
import NumberInput from "../../../../components/forms/NumberInput";
import TextInput from "../../../../components/forms/TextInput";
import SelectInput from "../../../../components/forms/SelectInput";
import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";
import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import { ISelectedProduct } from "./VendorOrderForm";

interface IPage2Prop {
  form;
  formState;
  newAllProducts: Array<any>;
  selectedProducts: Array<ISelectedProduct>;
  isCompressingImg: boolean;
  isFormLoading: boolean;
  edit: boolean;
  isCompleted: boolean;
  imageURL: string;
  setIsCompressingImg;
  onClearForm: () => void;
  onPreviousPage: () => void;
  setFormState;
  setFormTouched: () => void;
  setSelectedProducts: Dispatch<SetStateAction<Array<ISelectedProduct>>>;
}

export default function VendorOrderFormPage2({
  form,
  formState,
  newAllProducts,
  selectedProducts,
  isCompressingImg,
  isFormLoading,
  edit,
  isCompleted,
  imageURL,
  setIsCompressingImg,
  onClearForm,
  onPreviousPage,
  setFormState,
  setFormTouched,
  setSelectedProducts,
}: IPage2Prop) {
  const [search, setSearch] = useState("");
  const filteredProducts =
    search === ""
      ? newAllProducts
      : newAllProducts.filter((product) =>
          product.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(search.toLowerCase().replace(/\s+/g, ""))
        );
  const total = useMemo(() => {
    if (selectedProducts.length > 0) {
      return niceVisualDecimal(
        +selectedProducts.reduce(
          (prev, current) => prev + current.quantity * +current.price,
          0
        )
      );
    }
    return "0";
  }, [selectedProducts]);

  const [imageModalIsOpen, setModalOpen] = useState(false);
  const imageCompressAborter = useRef(new AbortController());

  const onClear = () => {
    imageCompressAborter.current.abort();
    imageCompressAborter.current = new AbortController();
    setIsCompressingImg(false);
    onClearForm();
  };

  const onAddProduct = (product) => {
    setFormTouched();
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
    const selectedProduct: ISelectedProduct = {
      ...product,
      appear: appear,
      price: "0",
      quantity: 0,
      unit: "BOX",
    };
    setSelectedProducts([
      selectedProduct,
      ...found,
      ...selectedProducts.filter((p) => p.name !== product.name),
    ]);
  };

  const onRemoveProduct = (id, appear) => {
    setSearch("");
    setFormTouched();
    setSelectedProducts(
      selectedProducts.filter(
        (product) => product.id !== id || product.appear !== appear
      )
    );
  };

  const onFieldChange = (
    value: number | string,
    inputId: string,
    i: number
  ) => {
    let clone = [...selectedProducts];
    if (inputId.includes("quantity")) {
      clone[i].quantity = +value;
    } else if (inputId.includes("price")) {
      clone[i].price = "" + value;
    } else if (inputId.includes("unit")) {
      clone[i].unit = "" + value;
    }
    setSelectedProducts(clone);
    setFormTouched();
  };

  return (
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
              form.setFieldValue("isTest", !form.values["isTest"])
            }
            checked={form.values["isTest"]}
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

                  form.setFieldValue("attachment", null);
                  form.setFieldValue("attachmentExists", false);
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
          ) : form.values.attachmentExists || isCompressingImg ? (
            <div className="custom-card sticker-primary relative w-full text-center dark:border-2">
              {isCompressingImg && (
                <button
                  type="button"
                  className="btn btn-circle btn-accent btn-sm absolute -right-4 -top-4 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop propagation to div

                    imageCompressAborter.current.abort();
                    imageCompressAborter.current = new AbortController();
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
                      const compressedFile = await imageCompression(file, {
                        maxSizeMB: 0.1,
                        signal: imageCompressAborter.current.signal,
                        onProgress: (progress) => {
                          if (progress < 100) {
                            setIsCompressingImg(true);
                          } else {
                            setIsCompressingImg(false);
                          }
                        },
                      });
                      form.setFieldValue("attachment", compressedFile);
                      form.setFieldValue("attachmentExists", true);
                    } catch (error) {
                      setFormState((prev) => ({
                        ...prev,
                        error: error.message,
                      }));
                      form.setFieldValue("attachment", null);
                      form.setFieldValue("attachmentExists", false);
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
              isCompleted ||
              isFormLoading ||
              (form.values.attachmentExists && !imageURL)
            }
          >
            <span>{edit ? "Update" : "Create"}</span>
          </button>

          <button
            type="button"
            className="btn btn-accent col-span-12"
            onClick={onClear}
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
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearch("")}
            onSelect={onAddProduct}
            onClear={() => setSearch("")}
          ></SearchSuggest>
        </div>

        {selectedProducts && selectedProducts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {selectedProducts.map((product, i) => (
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
                      value={product.quantity}
                      onChange={(e) =>
                        onFieldChange(
                          +e.target.value,
                          `products.quantity${product.id}-${product.appear}`,
                          i
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
                      value={product.price}
                      onChange={(e) =>
                        onFieldChange(
                          e.target.value,
                          `products.price${product.id}-${product.appear}`,
                          i
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
                      value={product.unit}
                      setValue={(v) =>
                        onFieldChange(
                          v,
                          `unit${product.id}-${product.appear}`,
                          i
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
                        form.values[
                          `products.price${product.id}-${product.appear}`
                        ] === ""
                          ? 0
                          : niceVisualDecimal(
                              parseFloat(
                                (product.quantity * +product.price).toString() // Silent linter.
                              )
                            )
                      }
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-circle btn-accent btn-sm absolute -right-4 -top-4 shadow-md"
                  onClick={() => onRemoveProduct(product.id, product.appear)}
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
  );
}
