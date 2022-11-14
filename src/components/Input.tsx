export default function Input({ id, type, placeholder, value, onChange }) {
  return (
  <>
    <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
    className="input border border-gray-400 focus:outline-none focus:border-primary w-full mt-2" />
  </>
  )
}