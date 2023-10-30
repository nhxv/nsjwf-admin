import { BiX } from "react-icons/bi";
import Modal from "../../../../components/Modal";
import { useFormik } from "formik";
import DateInput from "../../../../components/forms/DateInput";
import SelectSearch from "../../../../components/forms/SelectSearch";
import TextInput from "../../../../components/forms/TextInput";

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
      date: "",
    },
    onSubmit: (form_data) => {
      let url = "";
      if (form_data.manualCode) {
        url += `code=${encodeURIComponent(form_data.manualCode)}&`;
      }
      if (form_data.date) {
        url += `date=${form_data.date}&`;
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
          <div className="mb-6 flex flex-col gap-4 xl:grid xl:grid-cols-2">
            <div>
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
            <div>
              <label className="custom-label mb-2 inline-block">
                Completed on
              </label>
              <DateInput
                id="date"
                min="2022-01-01"
                max="2100-12-31"
                placeholder="Date"
                name="date"
                value={searchForm.values.date}
                onChange={searchForm.handleChange}
              ></DateInput>
            </div>
            <div>
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

            <div>
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
