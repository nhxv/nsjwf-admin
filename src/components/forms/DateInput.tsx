export default function DateInput({ id, name, placeholder, value, onChange, min, max }) {
  return (
  <>
    <input id={id} type="date" name={name} placeholder={placeholder} 
    value={value} onChange={onChange} min={min} max={max}
    className="input bg-transparent border-base-300 border-2 focus:outline-none focus:border-primary w-full" />
  </>
  )
}