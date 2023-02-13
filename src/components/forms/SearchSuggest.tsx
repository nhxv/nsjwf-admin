import SearchInput from "./SearchInput";

export default function SearchSuggest({
  query,
  items,
  onChange,
  onFocus,
  onSelect,
  onClear,
}) {
  return (
    <>
      <div className="w-full">
        <SearchInput
          id="search-suggest"
          placeholder="Search"
          name="search-suggest"
          value={query}
          onFocus={onFocus}
          onChange={onChange}
          onClear={onClear}
        ></SearchInput>
      </div>
      {items.length > 0 ? (
        <div className="rounded-btn my-2 max-h-72 overflow-auto border-2 border-base-300 p-2 shadow-md dark:bg-base-200">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-btn w-full cursor-pointer p-3 hover:bg-info focus:bg-info focus:text-primary"
              onClick={() => onSelect(item)}
            >
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      ) : null}
      {items?.length === 0 && query ? (
        <div className="rounded-btn my-2 border border-base-300 p-2 shadow-md">
          <p className="p-3">Not found.</p>
        </div>
      ) : null}
    </>
  );
}
