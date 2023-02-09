import { BiSearch, BiX } from "react-icons/bi";
import { useRef } from "react";

export default function SearchInput({ id, name, placeholder, value, onChange, onClear, onFocus }) {
  const searchRef = useRef(null);

  return (
  <>
    {/* <label htmlFor={id} className="sr-only">Search</label> */}
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <BiSearch className="w-6 h-6 text-neutral placeholder:text-base-300 dark:placeholder:text-base-300" />
      </div>

      {value || (document.activeElement === searchRef.current) ? (
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={onClear}>
        <BiX className="w-6 h-6 text-neutral placeholder:text-base-300 dark:placeholder:text-base-300" />
      </div>
      ) : null}

      <input ref={searchRef} type="text" placeholder={placeholder} id={id}
      name={name} value={value} onChange={onChange} onFocus={onFocus}
      className="input border-2 border-base-300 focus:outline-none focus:border-primary pl-10 w-full dark:placeholder:text-base-300" />
    </div>    
  </>
  )
}