import { useState } from "react";
import { Combobox } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";

export default function SelectSearch({
  name,
  value,
  setValue,
  options,
  nullable = false,
}) {
  const [selected, setSelected] = useState(value);
  const [query, setQuery] = useState("");

  const filteredOption =
    query === ""
      ? options
      : options.filter((option) =>
          option
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  const onChangeValue = (v) => {
    setValue(v);
    setSelected(v);
    setQuery("");
  };

  return (
    <div className="w-full">
      <Combobox
        name={name}
        value={selected}
        onChange={(v) => onChangeValue(v)}
        nullable={nullable}
      >
        <div className="relative">
          <div className="rounded-btn relative w-full cursor-default overflow-hidden bg-base-100 text-left">
            <Combobox.Input
              className="rounded-btn h-12 w-full border-2 border-base-300 bg-base-100 pl-3.5 pr-10 text-sm font-semibold focus-visible:border-primary focus-visible:outline-none dark:bg-base-200"
              displayValue={(option: any) => option}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
              <BiChevronDown className="h-6 w-6" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Combobox.Options className="rounded-btn absolute z-10 mt-1 max-h-72 w-full overflow-auto border-2 border-base-300 bg-base-100 py-2 shadow-md focus:outline-none dark:bg-base-200">
            {filteredOption.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none py-3 px-4">
                Nothing found.
              </div>
            ) : (
              filteredOption.map((option) => (
                <Combobox.Option
                  key={option}
                  className="rounded-btn relative mx-2 cursor-default select-none py-3 px-4 text-base-content 
                  ui-active:bg-info ui-active:text-info-content"
                  value={option}
                >
                  <span className="block truncate ui-selected:font-semibold ui-selected:text-info-content">
                    {option}
                  </span>
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
}
