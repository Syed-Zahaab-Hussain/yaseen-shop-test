import { useState, useRef, useEffect, useMemo } from "react";

const FilteredDropdown = ({
  items = [],
  value,
  onChange,
  displayField = "name",
  idField = "id",
  placeholder = "Select...",
  className = "",
  disabled = false,
  loading = false,
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter((item) =>
      String(item[displayField])
        .toLowerCase()
        .includes(search.toLowerCase().trim())
    );
  }, [items, displayField, search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredItems.length > 0) {
      onChange(filteredItems[0]);
      setIsOpen(false);
      setSearch("");
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (item) => {
    onChange(item);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-2 text-left bg-white border rounded-md flex items-center justify-between
          ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-gray-50"}
          ${error ? "border-red-500" : "border-gray-300"}
          ${className}
        `}
      >
        <span className="truncate">
          {value ? String(value[displayField]) : placeholder}
        </span>
        <span className="ml-2">
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <svg
              className={`w-4 h-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div
            ref={listRef}
            className="max-h-[300px] overflow-y-auto scroll-smooth"
            style={{ scrollBehavior: "smooth" }}
          >
            {filteredItems.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                No items found
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={String(item[idField])}
                  onClick={() => handleSelect(item)}
                  className={`
                    px-4 py-2 cursor-pointer flex items-center justify-between
                    ${
                      value && value[idField] === item[idField]
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-100"
                    }
                  `}
                  role="option"
                  aria-selected={value && value[idField] === item[idField]}
                >
                  <span className="truncate">{String(item[displayField])}</span>
                  {value && value[idField] === item[idField] && (
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilteredDropdown;
