export default function NumberInput({ id, name, placeholder, value, onChange, min, max }) {
  return (
  <>
    <input id={id} type="number" name={name} placeholder={placeholder} 
    value={value} onChange={onChange} min={min} max={max}
    className="input border-gray-300 border-2 focus:outline-none focus:border-primary w-full" />
  </>
  )
}