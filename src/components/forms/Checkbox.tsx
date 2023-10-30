export default function Checkbox({ id, name, onChange, checked, label }) {
  return (
    <>
      <input
        id={id}
        name={name}
        type="checkbox"
        onChange={onChange}
        checked={checked}
        className="checkbox checkbox-primary rounded-btn border-2 border-base-300"
      />
      <label htmlFor={id} className="ml-2">
        {label}
      </label>
    </>
  );
}
