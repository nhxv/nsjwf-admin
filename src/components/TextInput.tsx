export default function TextInput({ id, type, name, placeholder, value, onChange, onBlur }) {
  return (
  <>
    <input id={id} type={type} name={name} placeholder={placeholder} 
    value={value} onChange={onChange} onBlur={onBlur}
    className="input border-gray-300 border-2 focus:outline-none focus:border-primary w-full" />
  </>
  )
}