export default function Stepper({ steps, selected, onSelect, display }) {
  return (
    <ul className="steps w-full">
      {steps.map((s, index) => (
        <li
          key={s}
          className={`cursor-pointer step text-sm sm:text-base font-medium ${
            index <= steps.findIndex((step) => step === selected)
              ? "text-primary step-primary"
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
