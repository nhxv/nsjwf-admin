import { BiCloudUpload, BiImage, BiLeftArrowAlt, BiTrash, BiX } from "react-icons/bi";
import Checkbox from "../../../../components/forms/Checkbox";
import ImageModal from "../../../../components/forms/ImageModal";
import Spinner from "../../../../components/Spinner";
import FileInput from "../../../../components/forms/FileInput";
import imageCompression from "browser-image-compression";
import Alert from "../../../../components/Alert";
import SearchSuggest from "../../../../components/forms/SearchSuggest";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { IFormState, ISelectedProduct } from "./VendorOrderForm";
import { Control, Controller, UseFieldArrayPrepend, UseFieldArrayRemove, UseFieldArrayReplace, UseFormSetValue, useWatch } from "react-hook-form";
import VendorOrderProductRow from "./VendorOrderProductRow";
import VendorOrderTotal from "./VendorOrderTotal";

interface IPage2Prop {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  isSubmitting: boolean;
  formState: IFormState;
  allProducts: Array<any>;
  fields: Array<ISelectedProduct & { rowKey: string }>;
  prepend: UseFieldArrayPrepend<any, "products">;
  remove: UseFieldArrayRemove;
  replace: UseFieldArrayReplace<any, "products">;
  edit: boolean;
  isInitiallyCompleted: boolean;
  imageURL: string;
  onClearForm: () => void;
  onPreviousPage: () => void;
  markFormFilled: () => void;
  setFormState: Dispatch<SetStateAction<IFormState>>;
}

export default function VendorOrderFormPage2({
  control,
  setValue,
  isSubmitting,
  formState,
  allProducts,
  fields,
  prepend,
  remove,
  replace,
  edit,
  isInitiallyCompleted,
  imageURL,
  onClearForm,
  onPreviousPage,
  setFormState,
  markFormFilled,
}: IPage2Prop) {
  const [search, setSearch] = useState("");
  const filteredProducts =
    search === ""
      ? allProducts
      : allProducts.filter((product) => product.name.toLowerCase().replace(/\s+/g, "").includes(search.toLowerCase().replace(/\s+/g, "")));

  const isAttachmentExist = useWatch({ control, name: "isAttachmentExist" });

  const [imageModalIsOpen, setModalOpen] = useState(false);
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const imageCompressAborter = useRef(new AbortController());

  const onClear = () => {
    imageCompressAborter.current.abort();
    imageCompressAborter.current = new AbortController();
    setIsProcessingImg(false);
    onClearForm();
  };

  const toRow = (f: ISelectedProduct & { rowKey?: string }): ISelectedProduct => ({
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
    markFormFilled();
    setSearch("");

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
      price: "0",
      quantity: 0,
      unit: "BOX",
    });
  };

  const onRemoveProduct = (index: number) => {
    setSearch("");
    markFormFilled();
    remove(index);
  };

  const onRemoveAllProducts = () => {
    setSearch("");
    markFormFilled();
    replace([]);
  };

  return (
    <div className="flex min-h-screen flex-col items-start gap-6 xl:flex-row-reverse">
      {/* Submission box */}
      <div className="custom-card w-full xl:sticky xl:top-[84px] xl:w-5/12">
        <VendorOrderTotal control={control} />

        <div className="my-5 flex items-center">
          <Controller
            name="isTest"
            control={control}
            render={({ field }) => (
              <Checkbox id="test" name={field.name} label="Test" onChange={() => field.onChange(!field.value)} checked={field.value}></Checkbox>
            )}
          />
        </div>

        <div className="my-5 flex justify-between gap-2">
          {imageURL ? (
            <div
              className="custom-card sticker-primary relative w-full text-center hover:cursor-pointer dark:border-2"
              onClick={() => {
                setModalOpen(true);
              }}>
              <ImageModal isOpen={imageModalIsOpen} onClose={() => setModalOpen(false)} imageSrc={imageURL} />
              <button
                type="button"
                className="btn btn-circle btn-accent btn-sm absolute -right-4 -top-4 shadow-md"
                onClick={(e) => {
                  e.stopPropagation(); // Stop propagation to div

                  setValue("attachment", null);
                  setValue("isAttachmentExist", false);
                }}>
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
          ) : isAttachmentExist || isProcessingImg ? (
            <div className="custom-card sticker-primary relative w-full text-center dark:border-2">
              {isProcessingImg && (
                <button
                  type="button"
                  className="btn btn-circle btn-accent btn-sm absolute -right-4 -top-4 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop propagation to div

                    imageCompressAborter.current.abort();
                    imageCompressAborter.current = new AbortController();
                    setIsProcessingImg(false);
                  }}>
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
                            setIsProcessingImg(true);
                          } else {
                            setIsProcessingImg(false);
                          }
                        },
                      });
                      setValue("attachment", compressedFile);
                      setValue("isAttachmentExist", true);
                    } catch (error) {
                      setFormState((prev) => ({
                        ...prev,
                        error: error.message,
                      }));
                      setValue("attachment", null);
                      setValue("isAttachmentExist", false);
                      setTimeout(() => {
                        setFormState((prev) => ({
                          ...prev,
                          error: "",
                        }));
                      }, 1500);
                    }
                  }
                }}>
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
          <button type="button" className="btn-outline-primary btn col-span-6" onClick={onPreviousPage} disabled={isSubmitting}>
            <span>
              <BiLeftArrowAlt className="mr-1 h-7 w-7"></BiLeftArrowAlt>
            </span>
            <span>Go back</span>
          </button>
          <button type="submit" className="btn btn-primary col-span-6" disabled={isInitiallyCompleted || isSubmitting || (isAttachmentExist && !imageURL)}>
            <span>{edit ? "Update" : "Create"}</span>
          </button>

          <button type="button" className="btn btn-accent col-span-12" onClick={onClear}>
            <span>Revert change(s)</span>
          </button>
        </div>

        <div>
          {isSubmitting && (
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
        <div className="mb-6 flex gap-2">
          <SearchSuggest
            query={search}
            items={filteredProducts}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearch("")}
            onSelect={onAddProduct}
            onClear={() => setSearch("")}></SearchSuggest>
          <button type="button" className="btn btn-error col-span-12 md:col-span-6" onClick={onRemoveAllProducts}>
            <span>
              <BiTrash className="h-6 w-6"></BiTrash>
            </span>
          </button>
        </div>

        {fields && fields.length > 0 ? (
          <div className="flex flex-col gap-4">
            {fields.map((field, index) => (
              <VendorOrderProductRow
                key={field.rowKey}
                control={control}
                index={index}
                name={field.name}
                units={field.units}
                onRemove={() => onRemoveProduct(index)}
                markFormFilled={markFormFilled}
              />
            ))}
          </div>
        ) : (
          <Alert message={"No product selected."} type="empty"></Alert>
        )}
      </div>
    </div>
  );
}
