import imageCompression from "browser-image-compression";
import FileInput from "../../../../components/forms/FileInput";
import { BiCloudUpload } from "react-icons/bi";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../stores/api";
import { convertTime } from "../../../../commons/utils/time.util";
import { FormikProps } from "formik";
import { IFormState } from "./VendorOrderForm";
import Spinner from "../../../../components/Spinner";
import Alert from "../../../../components/Alert";

interface IPage0Prop {
  form: FormikProps<any>;
  onGoToPage1: () => void;
  fillFormWithProducts: (products: Array<any>) => void;
  setFormState: Dispatch<SetStateAction<IFormState>>;
}

export default function VendorOrderFormPage0({
  form,
  onGoToPage1,
  setFormState,
  fillFormWithProducts,
}: IPage0Prop) {
  const [isCompressingImg, setIsCompressingImg] = useState(false);
  const imageCompressAborter = useRef(new AbortController());

  const queryClient = useQueryClient();
  const autofillQuery = useQuery({
    queryKey: ["vendor-orders", "autofill"],
    queryFn: async ({ signal }) => {
      const result = await api.postForm(
        `/vendor-orders/autofill`,
        {
          attachment: form.values.attachment,
        },
        { signal: signal }
      );
      return result.data;
    },
    // This page is only displayed when the form is in create mode, which also means it has no attachment.
    enabled: !!form.values.attachment,
    refetchOnWindowFocus: false,
    // By default, React Query will return cache data before doing API call.
    // This is not what we want, and this cache is not reusable by query anyway.
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (autofillQuery.data) {
      const info = autofillQuery.data;

      const vendorName = info.vendor_name;
      const dateReceived = info.date_received;
      const products = info.products;
      const manualCode = info.manualCode ?? "";

      form.setFieldValue("vendorName", vendorName);
      form.setFieldValue("expectedAt", convertTime(new Date(dateReceived)));
      form.setFieldValue("manualCode", manualCode);

      fillFormWithProducts(products);
      onGoToPage1();
    }
  }, [autofillQuery.data]);

  const onCancelCompression = () => {
    imageCompressAborter.current.abort();
    imageCompressAborter.current = new AbortController();
    setIsCompressingImg(false);
  };

  const onCancelAutofilling = () => {
    queryClient.cancelQueries({ queryKey: ["vendor-orders", "autofill"] });
  };

  return (
    <div className="custom-card mx-auto grid grid-cols-12 gap-x-2 xl:w-7/12">
      <div className="col-span-12 mb-5">
        <Alert
          message="Autofill is an experimental feature. It may not be accurate."
          type="warning"
        />
      </div>

      {isCompressingImg ? (
        <div className="col-span-12 mb-5 flex flex-col items-center">
          <div>Compressing</div>
          <Spinner></Spinner>
        </div>
      ) : autofillQuery.isFetching ? (
        // Have to check explicitly because Modal closing takes time while the state switch is instant.
        // So while closing it'll display the wrong state.
        <div className="col-span-12 mb-5 flex flex-col items-center">
          <div>Filling</div>
          <Spinner></Spinner>
        </div>
      ) : !autofillQuery.isError ? (
        <div className="col-span-12 mb-5">
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
      ) : (
        <></>
      )}

      {isCompressingImg ? (
        <button
          type="button"
          className="btn btn-accent col-span-12 mb-5"
          onClick={() => {
            onCancelCompression();
          }}
        >
          Cancel compression
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-accent col-span-12 mb-5"
          onClick={(e) => {
            e.preventDefault();
            if (autofillQuery.isFetching) onCancelAutofilling();
            onGoToPage1();
          }}
        >
          Skip to filling manually
        </button>
      )}

      {autofillQuery.isError && (
        <div className="col-span-12">
          <Alert message="Unable to autofill." type="error" />
        </div>
      )}
    </div>
  );
}
