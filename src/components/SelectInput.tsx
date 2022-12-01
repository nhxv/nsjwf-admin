import { useState } from "react";

export default function SelectInput({ name, id, options, onChange }) {
  const [items, setItems] = useState(options);

  return (
  <>
    <select name={name} id={id}
    className="select block border-gray-400 focus:outline-none focus:border-primary w-full max-w-s"
    onChange={onChange}>
      {items.map((item) => {
        return (
          <option key={item} value={item}>{item}</option>
        )
      })}
    </select>
  </>
  )
}