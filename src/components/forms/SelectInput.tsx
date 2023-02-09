import { useState } from "react";
import { Listbox } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";


export default function SelectInput({name, form, field, options, value}) {
  const [selected, setSelected] = useState(value);

  const onChangeValue = (v) => {
    form.setFieldValue(field, v);
    setSelected(v);
  }

  return (
    <div className="w-full">
      <Listbox name={name} value={selected} onChange={onChangeValue}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-btn focus:border-primary ui-open:border-primary bg-base-100 py-3 pl-3.5 pr-10 text-left border-2 border-base-300 text-sm font-semibold">
            <span className="block truncate">{selected}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
              <BiChevronDown
                className="h-6 w-6"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 max-h-72 w-full overflow-auto rounded-btn bg-base-100 py-2 shadow-md border border-base-300 focus:outline-none z-10">
            {options.map((option) => (
              <Listbox.Option
                key={option}
                className="relative cursor-default select-none py-3 px-4 mx-2 rounded-btn ui-active:bg-info ui-active:text-info-content"
                value={option}
              >
              <span className="block truncate ui-selected:font-semibold ui-selected:text-primary">
                {option}
              </span>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  )
}
