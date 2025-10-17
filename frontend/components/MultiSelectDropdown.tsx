import { Plus, X } from "lucide-react";
import React, { useState } from "react";


export type MultiSelectDropdownProps<T> = {
  label: string;
  options: T[];
  selected: T[];
  onAdd: (item: T) => void;
  onRemove: (idx: number) => void;
  getOptionLabel: (item: T) => string;
  getOptionKey: (item: T) => string | number;
  buttonLabel?: string;
  onDropdownOpen?: () => void;
};

export function MultiSelectDropdown<T>({
  label,
  options,
  selected,
  onAdd,
  onRemove,
  getOptionLabel,
  getOptionKey,
  buttonLabel = "Add",
}: MultiSelectDropdownProps<T>) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const availableOptions = options.filter(
    (opt) => !selected.some((sel) => getOptionKey(sel) === getOptionKey(opt))
  );

  React.useEffect(() => {
    if (!showDropdown) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  React.useEffect(() => {
    if (!showDropdown) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowDropdown(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
        {label}
        <button
          type="button"
          className="ml-2 p-1 flex items-center gap-1"
          onClick={() => setShowDropdown((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={showDropdown}
        >
          <Plus size={18} />
          <span className="text-xs font-medium">{buttonLabel}</span>
        </button>
      </label>
      <div className="flex flex-wrap gap-1 mb-2">
        {selected.map((item, idx) => (
          <span
            key={getOptionKey(item) ?? idx}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center text-xs"
          >
            {getOptionLabel(item)}
            <button
              type="button"
              className="ml-1"
              onClick={() => onRemove(idx)}
              aria-label={`Remove ${getOptionLabel(item)}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      {showDropdown && (
        <div className="absolute z-10 bg-white border rounded shadow p-2 mt-1 max-h-40 overflow-y-auto" role="listbox">
          {availableOptions.length === 0 ? (
            <div className="text-gray-400 px-2 py-1">No more options</div>
          ) : (
            availableOptions.map((opt) => (
              <div
                key={getOptionKey(opt)}
                className="cursor-pointer hover:bg-blue-100 px-2 py-1"
                onClick={() => {
                  onAdd(opt);
                  setShowDropdown(false);
                }}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    onAdd(opt);
                    setShowDropdown(false);
                  }
                }}
                role="option"
                aria-selected="false"
              >
                {getOptionLabel(opt)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
