import { useState } from "react";
import { Listbox } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";

export default function SelectInput({ name, form, field, options, value }) {
  const [selected, setSelected] = useState(value);

  const onChangeValue = (v) => {
    form.setFieldValue(field, v);
    setSelected(v);
  };

  return (
    <div className="w-full">
      <Listbox name={name} value={selected} onChange={onChangeValue}>
        <div className="relative">
          <Listbox.Button className="rounded-btn relative w-full cursor-default border-2 border-base-300 bg-base-100 py-3 pl-3.5 pr-10 text-left text-sm font-semibold focus:border-primary ui-open:border-primary dark:bg-base-200">
            <span className="block truncate">{selected}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
              <BiChevronDown className="h-6 w-6" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="rounded-btn absolute z-10 mt-1 max-h-72 w-full overflow-auto border-2 border-base-300 bg-base-100 py-2 shadow-md focus:outline-none dark:bg-base-200">
            {options.map((option) => (
              <Listbox.Option
                key={option}
                className="rounded-btn relative mx-2 cursor-default select-none py-3 px-4 ui-active:bg-info ui-active:text-info-content"
                value={option}
              >
                <span className="block truncate ui-selected:font-semibold ui-selected:text-info-content">
                  {option}
                </span>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
