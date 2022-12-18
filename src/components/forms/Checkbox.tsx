export default function Checkbox({
  id,
  name,
  onChange,
  checked,
  label,
}) {
  return (
  <>
    <input id={id} name={name} type="checkbox" 
    onChange={onChange} 
    checked={checked} 
    className="checkbox checkbox-primary border-gray-300 border-2 rounded-md"/>
    <label htmlFor={id} className="ml-2">{label}</label>
  </>
  )
}