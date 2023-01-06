export default function NumberInput({ id, name, placeholder, value, onChange, min, max, disabled }) {
  return (
  <>
    <input id={id} type="number" name={name} placeholder={placeholder} 
    value={value} onChange={onChange} min={min} max={max} disabled={disabled}
    className="input border-base-300 border-2 placeholder:text-base-300 focus:outline-none focus:border-primary w-full" />
  </>
  )
}