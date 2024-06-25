import { useFormik } from "formik";
import { BiSearch } from "react-icons/bi";
import DateInput from "../../../../components/forms/DateInput";
import SelectSearch from "../../../../components/forms/SelectSearch";
import TextInput from "../../../../components/forms/TextInput";

interface SearchSaleModalProps {
  customers: Array<any>;
  onSearchSubmit: (urlParams: string) => void;
}

export default function SearchSaleForm({
  customers,
  onSearchSubmit,
}: SearchSaleModalProps) {
  const searchForm = useFormik({
    initialValues: {
      manualCode: "",
      customer: "",
      product: "",
      start_date: "",
      end_date: "",
    },
    onSubmit: (form_data) => {
      let url = "";
      if (form_data.manualCode) {
        url += `code=${encodeURIComponent(form_data.manualCode)}&`;
      }
      if (form_data.start_date) {
        url += `start_date=${form_data.start_date}&`;
      }
      if (form_data.end_date) {
        url += `end_date=${form_data.end_date}&`;
      }
      if (Object.keys(form_data.customer).length !== 0) {
        url += `customer=${encodeURIComponent(form_data.customer)}&`;
      }
      if (Object.keys(form_data.product).length !== 0) {
        url += `product=${encodeURIComponent(form_data.product)}&`;
      }
      onSearchSubmit(url);
    },
  });

  return (
    <form onSubmit={searchForm.handleSubmit}>
      <div className="mb-4 flex flex-col items-end gap-3 sm:flex-row">
        <div className="shrink-0 basis-1/12">
          <label className="custom-label mb-2 inline-block">Code</label>
          <TextInput
            id="by-code"
            placeholder="Code"
            name="by-code"
            value={searchForm.values.manualCode}
            onChange={(e) =>
              searchForm.setFieldValue("manualCode", e.target.value)
            }
          />
        </div>
        <div className="shrink-0 basis-1/12">
          <label className="custom-label mb-2 inline-block">From</label>
          <DateInput
            id="start_date"
            min="2022-01-01"
            max="2100-12-31"
            placeholder="Date"
            name="start_date"
            value={searchForm.values.start_date}
            onChange={searchForm.handleChange}
          ></DateInput>
        </div>
        <div className="shrink-0 basis-1/12">
          <label className="custom-label mb-2 inline-block">To</label>
          <DateInput
            id="end_date"
            min="2022-01-01"
            max="2100-12-31"
            placeholder="Date"
            name="end_date"
            value={searchForm.values.end_date}
            onChange={searchForm.handleChange}
          ></DateInput>
        </div>
        <div className="w-full">
          <label className="custom-label mb-2 inline-block">Customer</label>
          <SelectSearch
            name="customer-select"
            value={searchForm.values.customer}
            setValue={(customer) => {
              // This can be null, and we don't want that.
              searchForm.setFieldValue("customer", customer ? customer : "");
            }}
            options={customers.map((v) => v.name)}
            nullable={true}
          />
        </div>
        <div className="w-full">
          <label className="custom-label mb-2 inline-block">Product</label>
          <TextInput
            id="product-select"
            name="product-select"
            placeholder="Keywords"
            onChange={(e) => {
              searchForm.setFieldValue(
                "product",
                e.target.value ? e.target.value : ""
              );
            }}
            value={searchForm.values.product}
          />
        </div>
        <button type="submit" className="btn btn-accent">
          <BiSearch className="h-6 w-6"></BiSearch>
        </button>
      </div>
    </form>
  );
}
