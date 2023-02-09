export default function NumberInput({ id, placeholder, name, value, onChange, min, max, disabled }) {
  return (
  <>
    <input id={id} type="number" placeholder={placeholder} min={min} max={max} 
    name={name} value={value} onChange={onChange} onFocus={(e) => e.target.select()} disabled={disabled}
    className="input bg-transparent border-base-300 border-2 placeholder:text-base-300 dark:placeholder:text-neutral focus:outline-none focus:border-primary w-full dark:disabled:bg-base-300" />
  </>
  )
}