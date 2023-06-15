import { Combobox } from "@headlessui/react";
import { useRef, useState } from "react";
import { BiSearch, BiX } from "react-icons/bi";

export default function SearchSuggest({
  query,
  items,
  onChange,
  onFocus,
  onSelect,
  onClear,
  optionsHeight = "max-h-72",
}) {
  const [open, setOpen] = useState(items.length > 0);
  const searchRef = useRef(null);

  const onFocusSearch = () => {
    setOpen(true);
    onFocus();
  };

  const onChangeSearch = (e) => {
    setOpen(true);
    onChange(e);
  };

  const onSelectItem = (item) => {
    setOpen(false);
    onSelect(item);
  };

  const onClearSuggest = () => {
    setOpen(false);
    onClear();
  };

  return (
    <div className="w-full">
      <Combobox onChange={(item) => onSelectItem(item)}>
        <div className="relative">
          <div className="rounded-btn relative w-full cursor-default overflow-hidden text-left">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <BiSearch className="h-6 w-6 text-neutral placeholder:text-base-300 dark:placeholder:text-base-300" />
            </div>
            <Combobox.Input
              ref={searchRef}
              className="input w-full border-2 border-base-300 bg-transparent pl-10 focus:border-primary focus:outline-none dark:bg-transparent dark:placeholder:text-neutral"
              displayValue={() => ""}
              onChange={(e) => onChangeSearch(e)}
              onFocus={onFocusSearch}
              autoComplete="off"
            />
            {document.activeElement === searchRef.current && (
              <div
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
                onClick={onClearSuggest}
              >
                <BiX className="h-6 w-6 text-neutral" />
              </div>
            )}
          </div>
          {open && (
            <Combobox.Options
              static
              className={`rounded-btn absolute z-10 mt-1 ${optionsHeight} w-full overflow-auto border-2 border-base-300 bg-base-100 py-2 shadow-md focus:outline-none dark:bg-base-200`}
            >
              {items.length === 0 ? (
                <div className="relative cursor-default select-none py-3 px-4">
                  Nothing found.
                </div>
              ) : (
                items.map((item) => (
                  <Combobox.Option
                    key={item.id}
                    className="rounded-btn relative mx-2 cursor-default select-none py-3 px-4 text-base-content 
                    ui-active:bg-info ui-active:text-info-content"
                    value={item}
                  >
                    <span className="block truncate ui-selected:font-semibold ui-selected:text-info-content">
                      {item.name}
                    </span>
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
}
