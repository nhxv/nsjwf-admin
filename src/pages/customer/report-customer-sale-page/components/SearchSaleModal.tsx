import { BiX } from "react-icons/bi";
import Modal from "../../../../components/Modal";
import { useFormik } from "formik";
import DateInput from "../../../../components/forms/DateInput";
import SelectSearch from "../../../../components/forms/SelectSearch";
import TextInput from "../../../../components/forms/TextInput";
import { convertTime } from "../../../../commons/utils/time.util";

interface SearchSaleModalProps {
  isOpen: boolean;
  customers: Array<any>;
  onSearchSubmit: (urlParams: string) => void;
  onClose: () => any;
}

export default function SearchSaleModal({
  isOpen,
  customers,
  onSearchSubmit,
  onClose,
}: SearchSaleModalProps) {
  const searchForm = useFormik({
    initialValues: {
      manualCode: "",
      customer: "",
      product: "",
      start_date: "",
      end_date: convertTime(new Date()),
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
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideOverflow={false}>
      <div className="custom-card text-left">
        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-circle btn-accent btn-sm"
            onClick={onClose}
          >
            <span>
              <BiX className="h-6 w-6"></BiX>
            </span>
          </button>
        </div>
        <form onSubmit={searchForm.handleSubmit}>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="grow-0 basis-1/4">
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
            <div className="grow">
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
            <div className="grow">
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
          </div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="w-full">
              <label className="custom-label mb-2 inline-block">Customer</label>
              <SelectSearch
                name="customer-select"
                value={searchForm.values.customer}
                setValue={(customer) => {
                  // This can be null, and we don't want that.
                  searchForm.setFieldValue(
                    "customer",
                    customer ? customer : ""
                  );
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
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-accent w-full"
              //disabled={stateReducer.loading}
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
