export default function NumberInput({
  id,
  placeholder,
  name,
  value,
  onChange,
  min,
  max,
  disabled,
}) {
  return (
    <>
      <input
        id={id}
        type="number"
        placeholder={placeholder}
        min={min}
        max={max}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={(e) => e.target.select()}
        disabled={disabled}
        className="input w-full border-2 border-base-300 bg-transparent placeholder:text-base-300 focus:border-primary focus:outline-none dark:placeholder:text-neutral dark:disabled:bg-base-300"
      />
    </>
  );
}
