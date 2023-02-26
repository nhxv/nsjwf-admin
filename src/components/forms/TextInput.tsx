// accept input type due to email & password
export default function TextInput({
  id,
  type,
  placeholder,
  name,
  value,
  onChange,
}) {
  return (
    <>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={(e) => e.target.select()}
        className="input w-full border-2 border-base-300 placeholder:text-base-300 focus:border-primary focus:outline-none dark:bg-base-200 dark:placeholder:text-neutral"
      />
    </>
  );
}
