export default function Stepper({ steps, selected, onSelect, display }) {
  return (
    <ul className="steps w-full">
      {steps.map((s, index) => (
        <li
          key={s}
          className={`step cursor-pointer text-sm font-medium sm:text-base ${
            index <= steps.findIndex((step) => step === selected)
              ? "step-primary text-primary"
              : ""
          }`}
          onClick={() => onSelect(s)}
        >
          {display(s.toLowerCase())}
        </li>
      ))}
    </ul>
  );
}
