import { BiRightArrowAlt } from "react-icons/bi";
import { OrderStatus } from "../../../../commons/enums/order-status.enum";
import DateInput from "../../../../components/forms/DateInput";
import SelectInput from "../../../../components/forms/SelectInput";
import SelectSearch from "../../../../components/forms/SelectSearch";
import TextInput from "../../../../components/forms/TextInput";

interface IPage1Prop {
  form;
  vendors: Array<any>;
  isFormLoading: boolean;
  onNextPage: () => void;
  onClearForm: () => void;
}

export default function VendorOrderFormPage1({
  form,
  vendors,
  isFormLoading,
  onNextPage,
  onClearForm,
}: IPage1Prop) {
  return (
    <div className="custom-card mx-auto grid grid-cols-12 gap-x-2 xl:w-7/12">
      {/* 1st page */}
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
  );
}
