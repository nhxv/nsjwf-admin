import { BiRightArrowAlt } from "react-icons/bi";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import DateInput from "../../../../components/forms/DateInput";
import SelectInput from "../../../../components/forms/SelectInput";
import SelectSearch from "../../../../components/forms/SelectSearch";
import TextInput from "../../../../components/forms/TextInput";
import { FormikProps } from "formik";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../stores/api";
import { IFormState } from "./VendorOrderForm";

interface IPage1Prop {
  form: FormikProps<any>;
  formState: IFormState;
  vendors: Array<any>;
  onClearForm: () => void;
  onGoToPage2: () => void;
  fillFormWithProducts: (products: Array<any>) => void;
}

export default function VendorOrderFormPage1({
  form,
  formState,
  vendors,
  onClearForm,
  onGoToPage2,
  fillFormWithProducts,
}: IPage1Prop) {
  const templateQuery = useQuery({
    queryKey: ["vendors", "active", "tendency", form.values["vendorName"]],
    queryFn: async () => {
      // Non-critical function, return an empty array if it fails
      // (like no tendency or initial load).
      try {
        const vendorName = form.values["vendorName"];
        const result = await api.get(
          `/vendors/active/tendency/${encodeURIComponent(vendorName)}`
        );
        return result.data.vendorProductTendencies;
      } catch {
        return [];
      }
    },
    // Suppress the warning when vendorName is not yet available.
    enabled: !!form.values["vendorName"] && !formState.isFilled,
    refetchOnWindowFocus: false,
  });

  const onNextPage = () => {
    if (!formState.isFilled) {
      if (templateQuery.isSuccess && templateQuery.data.length > 0) {
        const template = templateQuery.data;
        fillFormWithProducts(template);
      }
    }
    onGoToPage2();
  };

  return (
    <div className="custom-card mx-auto grid grid-cols-12 gap-x-2 xl:w-7/12">
      <div className="col-span-12 mb-5 xl:col-span-6">
        <label className="custom-label mb-2 inline-block">
          <span>Order to vendor</span>
          <span className="text-red-500">*</span>
        </label>
        <SelectSearch
          name="vendor"
          value={form.values["vendorName"]}
          setValue={(v) => form.setFieldValue("vendorName", v)}
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
          value={form.values.manualCode}
          onChange={form.handleChange}
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
          value={form.values[`expectedAt`]}
          onChange={(e) => form.setFieldValue("expectedAt", e.target.value)}
        ></DateInput>
      </div>

      <div className="col-span-12 mb-5 xl:col-span-6">
        <label htmlFor="status" className="custom-label mb-2 inline-block">
          Status
        </label>
        <SelectInput
          name="status"
          value={form.values["status"]}
          setValue={(v) => form.setFieldValue("status", v)}
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

      {form.values[`vendorName`] && (
        <button
          type="button"
          className="btn btn-primary col-span-12 mt-3"
          onClick={onNextPage}
          disabled={templateQuery.isFetching}
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
  );
}
