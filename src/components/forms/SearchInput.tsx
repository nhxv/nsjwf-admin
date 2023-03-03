import { BiSearch, BiX } from "react-icons/bi";
import { useRef } from "react";

export default function SearchInput({
  id,
  name,
  placeholder,
  value,
  onChange,
  onClear,
  onFocus,
}) {
  const searchRef = useRef(null);

  return (
    <>
      {/* <label htmlFor={id} className="sr-only">Search</label> */}
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <BiSearch className="h-6 w-6 text-neutral placeholder:text-base-300 dark:placeholder:text-base-300" />
        </div>

        {document.activeElement === searchRef.current && (
          <div
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
            onClick={onClear}
          >
            <BiX className="h-6 w-6 text-neutral" />
          </div>
        )}

        <input
          ref={searchRef}
          type="text"
          placeholder={placeholder}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          className="input w-full border-2 border-base-300 bg-base-100 pl-10 focus:border-primary focus:outline-none dark:bg-base-200 dark:placeholder:text-neutral"
        />
      </div>
    </>
  );
}
