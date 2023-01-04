export default function TextInput({ id, type, name, placeholder, value, onChange }) {
  return (
  <>
    <input id={id} type={type} name={name} placeholder={placeholder} 
    value={value} onChange={onChange}
    className="input border-base-300 dark:placeholder:text-base-300 border-2 focus:outline-none focus:border-primary w-full" />
  </>
  )
}