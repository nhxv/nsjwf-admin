import { BiX } from "react-icons/bi";
import { Control, Controller, useWatch } from "react-hook-form";
import NumberInput from "../../../../components/forms/NumberInput";
import TextInput from "../../../../components/forms/TextInput";
import SelectInput from "../../../../components/forms/SelectInput";
import { niceVisualDecimal } from "../../../../commons/utils/fraction.util";

interface IVendorOrderProductRowProps {
  control: Control<any>;
  index: number;
  name: string;
  units: Array<any>;
  onRemove: () => void;
  markFormFilled: () => void;
}

// Reads and writes only its own `products.${index}` slice, so a keystroke
// here re-renders this row alone, not the whole product list.
export default function VendorOrderProductRow({
  control,
  index,
  name,
  units,
  onRemove,
  markFormFilled,
}: IVendorOrderProductRowProps) {
  const quantity = useWatch({ control, name: `products.${index}.quantity` });
  const price = useWatch({ control, name: `products.${index}.price` });

  return (
    <div className="custom-card relative w-full p-3">
      <div className="mb-2 grid grid-cols-12 items-center gap-2">
        <div className="col-span-12 xl:col-span-4">
          <span className="text-lg font-semibold">{name}</span>
          <div className="custom-badge mt-1 bg-accent text-accent-content">
            <span>Product</span>
          </div>
        </div>
        <div className="col-span-6 xl:col-span-2">
          <label className="custom-label mb-2 inline-block">Qty</label>
          <Controller
            name={`products.${index}.quantity`}
            control={control}
            render={({ field }) => (
              <NumberInput
                id={`quantity-${index}`}
                placeholder="Qty"
                name={field.name}
                value={field.value}
                onChange={(e) => {
                  field.onChange(+e.target.value);
                  markFormFilled();
                }}
              ></NumberInput>
            )}
          />
        </div>
        <div className="col-span-6 xl:col-span-2">
          <label className="custom-label mb-2 inline-block">Unit Price</label>
          <Controller
            name={`products.${index}.price`}
            control={control}
            render={({ field }) => (
              <TextInput
                id={`price-${index}`}
                placeholder="Price"
                name={field.name}
                value={field.value}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  markFormFilled();
                }}
              ></TextInput>
            )}
          />
        </div>
        <div className="col-span-6 xl:col-span-2">
          <label className="custom-label mb-2 inline-block">Unit</label>
          <Controller
            name={`products.${index}.unit`}
            control={control}
            render={({ field }) => (
              <SelectInput
                name={field.name}
                value={field.value}
                setValue={(v) => {
                  field.onChange(v);
                  markFormFilled();
                }}
                options={units.map((unit) => unit.code.split("_")[1])}
              ></SelectInput>
            )}
          />
        </div>
        <div className="col-span-6 xl:col-span-2">
          <div className="custom-label mb-2">Amount</div>
          <div className="rounded-box flex h-12 items-center bg-base-300 px-3">
            {price === ""
              ? 0
              : niceVisualDecimal(parseFloat((quantity * +price).toString()))}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-circle btn-accent btn-sm absolute -right-4 -top-4 shadow-md"
        onClick={onRemove}
      >
        <span>
          <BiX className="h-6 w-6"></BiX>
        </span>
      </button>
    </div>
  );
}
