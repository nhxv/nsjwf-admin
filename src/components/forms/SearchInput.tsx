import { useFormik } from "formik";
import { BiSearch } from "react-icons/bi";

export default function SearchInput({id, name, placeholder, value, onChange }) {

  return(
  <>
    {/* <label htmlFor={id} className="sr-only">Search</label> */}
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <BiSearch className="w-6 h-6 text-base-300 dark:placeholder:text-base-300" />
      </div>
      <input type="text" id={id} name={name} value={value} onChange={onChange}
      className="input border-2 border-base-300 focus:outline-none focus:border-primary pl-10 w-full dark:placeholder:text-base-300" 
      placeholder={placeholder} />
    </div>    
  </>
  )
}