import SearchInput from "./SearchInput";

export default function SearchSuggest({query, items, onChange, onFocus, onSelect, onClear}) {
  return (
  <>
    <div className="w-full">
      <SearchInput id="search-suggest" placeholder="Search"
      name="search-suggest" value={query} onFocus={onFocus}
      onChange={onChange} onClear={onClear}></SearchInput>
    </div>
    {items.length > 0 ? (
    <div className="my-2 border-2 border-base-300 dark:bg-base-200 rounded-btn p-2 shadow-md max-h-72 overflow-auto">
      {items.map((item, index) => (
      <div key={index} className="cursor-pointer w-full p-3 rounded-btn hover:bg-info focus:bg-info focus:text-primary" 
      onClick={() => onSelect(item)}>
        <p>{item.name}</p>
      </div>
      ))}
    </div>) : null}
    {items?.length === 0 && query ? (
    <div className="my-2 border border-base-300 rounded-btn p-2 shadow-md">
      <p className="p-3">Not found.</p>
    </div>) : null}
  </>
  )
}