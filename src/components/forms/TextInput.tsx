export default function TextInput({ id, type, placeholder, name, value, onChange }) {
  return (
  <>
    <input id={id} type={type} placeholder={placeholder} 
    name={name} value={value} onChange={onChange} onFocus={(e) => e.target.select()}
    className="input border-base-300 dark:bg-base-200 placeholder:text-base-300 dark:placeholder:text-neutral border-2 focus:outline-none focus:border-primary w-full" />
  </>
  )
}