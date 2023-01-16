import SearchInput from "./SearchInput";

export default function SearchSuggest({query, items, onChange, onFocus, onSelect, onClear}) {
  return (
  <>
    <div className="w-full">
      <SearchInput id="search-suggest" name="search-suggest" placeholder="Search"
      onChange={onChange} value={query} onFocus={onFocus}
      onClear={onClear}></SearchInput>
    </div>
    {items.length > 0 ? (
    <div className="my-2 border border-base-300 rounded-btn p-2 shadow-md max-h-72 overflow-auto">
      {items.map((item, index) => (
      <div key={index} className="cursor-pointer w-full p-3 rounded-btn hover:bg-info" 
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