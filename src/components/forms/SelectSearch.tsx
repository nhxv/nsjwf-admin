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
    setQuery("");
  }      

  return (
    <div className="w-full">
      <Combobox value={selected} onChange={(v) => onChangeValue(v)} name={name}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default rounded-btn overflow-hidden bg-base-100 text-left">
            <Combobox.Input
              className="w-full bg-base-100 border-2 border-base-300 focus-visible:outline-none focus-visible:border-primary rounded-btn py-3 pl-3.5 pr-10 text-sm font-semibold"
              displayValue={(option: any) => option}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
              <BiChevronDown
                className="h-6 w-6"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Combobox.Options className="z-10 absolute mt-1 max-h-70 w-full overflow-auto rounded-btn bg-base-100 py-2 shadow-md border border-base-300 focus:outline-none">
            {filteredOption.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none py-3 px-4">
                Nothing found.
              </div>
            ) : (
              filteredOption.map((option) => (
                <Combobox.Option
                  key={option}
                  className="relative cursor-default select-none py-3 px-4 mx-2 rounded-btn text-base-content 
                  ui-active:bg-info ui-active:text-info-content"
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
