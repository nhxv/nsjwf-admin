import { useState } from "react";
import { Combobox } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";

export default function SelectSearch({ name, form, field, options, value }) {
  const [selected, setSelected] = useState(value);
  const [query, setQuery] = useState("");

  const filteredOption = query === "" ? options : options.filter((option) =>
          option.toLowerCase().replace(/\s+/g, "").includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  const onChangeValue = (v) => {
    form.setFieldValue(field, v);
    setSelected(v);
  }      

  return (
    <div className="w-full">
      <Combobox value={selected} onChange={(v) => onChangeValue(v)} name={name}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default rounded-btn overflow-hidden bg-white text-left">
            <Combobox.Input
              className="w-full border-2 border-gray-300 focus-visible:outline-none focus-visible:border-primary rounded-btn py-3 pl-3.5 pr-10 text-sm font-semibold"
              displayValue={(option: any) => option}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
              <BiChevronDown
                className="h-6 w-6 text-black"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Combobox.Options className="z-10 absolute mt-1 max-h-60 w-full overflow-auto rounded-btn bg-white py-2 shadow-md border border-gray-300 focus:outline-none sm:text-sm">
            {filteredOption.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none py-3 px-4 text-black">
                Nothing found.
              </div>
            ) : (
              filteredOption.map((option) => (
                <Combobox.Option
                  key={option}
                  className="relative cursor-default select-none py-3 px-4 mx-2 rounded-btn text-black 
                  ui-active:bg-emerald-100 ui-active:text-primary"
                  value={option}>
                  <span className="block truncate ui-selected:font-semibold ui-selected:text-primary">
                    {option}
                  </span>
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  )
}
