"use client";

import { useState } from "react";

interface ValuesSelectorProps {
  selectedValues: string[];
  availableValues: string[];
  onUpdate: (values: string[]) => void;
  onClose: () => void;
}

export function ValuesSelector({
  selectedValues,
  availableValues,
  onUpdate,
  onClose,
}: ValuesSelectorProps) {
  const [customValue, setCustomValue] = useState("");

  const toggleValue = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onUpdate(newValues);
  };

  const addCustomValue = () => {
    if (customValue.trim() && !selectedValues.includes(customValue.trim())) {
      onUpdate([...selectedValues, customValue.trim()]);
      setCustomValue("");
    }
  };

  const removeValue = (value: string) => {
    onUpdate(selectedValues.filter((v) => v !== value));
  };

  return (
    <div className="bg-white/90 rounded-xl p-6 border border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-800">
          Values & Life Lessons
        </h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Selected Values */}
      {selectedValues.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {selectedValues.map((value) => (
              <span
                key={value}
                className="inline-flex items-center px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium"
              >
                {value}
                <button
                  onClick={() => removeValue(value)}
                  className="ml-2 text-yellow-600 hover:text-yellow-800 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Value */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomValue();
              }
            }}
            placeholder="Add a custom value..."
            className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-orange-400 focus:bg-white transition-all duration-200 shadow-sm hover:border-gray-300"
          />
          <button
            onClick={addCustomValue}
            disabled={!customValue.trim()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Add
          </button>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-3">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {availableValues.map((value) => {
            const isSelected = selectedValues.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleValue(value)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 border
                  ${
                    isSelected
                      ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                      : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                  }
                `}
              >
                + {value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
