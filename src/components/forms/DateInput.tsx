export default function DateInput({
  id,
  placeholder,
  name,
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
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="input w-full border-2 border-base-300 focus:border-primary focus:outline-none dark:bg-base-200"
      />
    </>
  );
}
