export default function TabGroup({ group, selected, onSelect, display }) {
  return (
    <div className="rounded-box flex gap-2 bg-base-300 p-2 dark:bg-base-200">
      {group.map((item) => (
        <div
          key={item}
          className={`rounded-box w-32 cursor-pointer p-3 text-center font-medium ${
            item === selected
              ? "bg-base-100 text-primary shadow-md dark:bg-base-300 dark:text-white"
              : "hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"
          }`}
          onClick={() => onSelect(item)}
        >
          {display ? display(item.toLowerCase()) : item}
        </div>
      ))}
    </div>
  );
}
