export default function DateInput({
  id,
  name,
  placeholder,
  value,
  onChange,
  min,
  max,
}) {
  return (
    <>
      <input
        id={id}
        type="date"
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="input w-full border-2 border-base-300 bg-transparent focus:border-primary focus:outline-none"
      />
    </>
  );
}
