import { Controller, useForm } from "react-hook-form";
import { BiX } from "react-icons/bi";
import Modal from "../../../../components/Modal";
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
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      manualCode: "",
      customer: "",
      product: "",
      start_date: convertTime(startOfMonth),
      end_date: convertTime(new Date()),
    },
  });

  const onSubmit = (form_data) => {
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
  };

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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="grow-0 basis-1/4">
              <label className="custom-label mb-2 inline-block">Code</label>
              <Controller
                name="manualCode"
                control={control}
                render={({ field }) => (
                  <TextInput
                    id="by-code"
                    placeholder="Code"
                    name="by-code"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="grow">
              <label className="custom-label mb-2 inline-block">From</label>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <DateInput
                    id="start_date"
                    min="2022-01-01"
                    max="2100-12-31"
                    placeholder="Date"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  ></DateInput>
                )}
              />
            </div>
            <div className="grow">
              <label className="custom-label mb-2 inline-block">To</label>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <DateInput
                    id="end_date"
                    min="2022-01-01"
                    max="2100-12-31"
                    placeholder="Date"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  ></DateInput>
                )}
              />
            </div>
          </div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="w-full">
              <label className="custom-label mb-2 inline-block">Customer</label>
              <Controller
                name="customer"
                control={control}
                render={({ field }) => (
                  <SelectSearch
                    name="customer-select"
                    value={field.value}
                    setValue={(customer) => {
                      // This can be null, and we don't want that.
                      field.onChange(customer ? customer : "");
                    }}
                    options={customers.map((v) => v.name)}
                    nullable={true}
                  />
                )}
              />
            </div>

            <div className="w-full">
              <label className="custom-label mb-2 inline-block">Product</label>
              <Controller
                name="product"
                control={control}
                render={({ field }) => (
                  <TextInput
                    id="product-select"
                    name="product-select"
                    placeholder="Keywords"
                    onChange={(e) =>
                      field.onChange(e.target.value ? e.target.value : "")
                    }
                    value={field.value}
                  />
                )}
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
