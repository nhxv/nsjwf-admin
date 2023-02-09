export default function TabGroup({ group, selected, onSelect, display }) {
  return (    
    <div className="bg-base-300 dark:bg-base-200 rounded-box p-2 flex gap-2">
      {group.map((item) => (
        <div key={item} 
        className={`cursor-pointer rounded-box p-3 w-32 font-medium text-center ${item === selected ? "bg-base-100 shadow-md text-primary dark:bg-base-300 dark:text-white" : "hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"}`}
        onClick={() => onSelect(item)}>{display ? display(item.toLowerCase()) : item}</div>
      ))}
    </div>
  );
}