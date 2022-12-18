import { useState } from "react";

export default function SelectInput({ name, id, options, onChange, value }) {
  const [items, setItems] = useState(options);

  return (
  <>
    <select name={name} id={id}
    className="select block border-2 border-gray-300 focus:outline-none focus:border-primary w-full max-w-s"
    onChange={onChange}
    value={value}>
      {items.map((item) => {
        return (
          <option key={item} value={item}>{item}</option>
        )
      })}
    </select>
  </>
  )
}