"use client";

import { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface InlineFieldProps {
  value: string;
  placeholder: string;
  onUpdate: (value: string) => void;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  type: "text" | "number" | "select" | "custom";
  options?: Option[];
  width?: string;
}

export function InlineField({
  value,
  placeholder,
  onUpdate,
  isActive,
  onActivate,
  onDeactivate,
  type,
  options = [],
  width = "auto",
}: InlineFieldProps) {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isActive) {
      if (type === "select" && selectRef.current) {
        selectRef.current.focus();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isActive, type]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleSave = () => {
    onUpdate(inputValue);
    onDeactivate();
  };

  const handleCancel = () => {
    setInputValue(value);
    onDeactivate();
  };

  const handleBlur = () => {
    // Small delay to allow for dropdown selection
    setTimeout(() => {
      handleSave();
    }, 150);
  };

  const displayValue = value || placeholder;
  const isEmpty = !value;

  if (type === "custom") {
    // Custom type for special handling (like values selector)
    return (
      <button
        onClick={onActivate}
        className={`
          inline-flex items-center px-3 py-2 rounded-lg border-2 border-dashed transition-all duration-200 font-medium
          ${
            isEmpty
              ? "border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100"
              : "border-orange-400 text-orange-700 bg-orange-100 hover:bg-orange-200"
          }
          ${isActive ? "ring-2 ring-orange-300" : ""}
        `}
        style={{ height: "40px" }} // Fixed height to match other fields
      >
        {displayValue}
        <svg
          className="w-4 h-4 ml-1 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    );
  }

  if (!isActive) {
    return (
      <button
        onClick={onActivate}
        className={`
          inline-flex items-center px-3 py-2 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 font-medium
          ${
            isEmpty
              ? "border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100"
              : "border-orange-400 text-orange-700 bg-orange-100 hover:bg-orange-200"
          }
        `}
        style={{
          minWidth: width === "auto" ? "80px" : width,
          height: "40px", // Fixed height to match input fields
        }}
      >
        {displayValue}
        {type === "select" && (
          <svg
            className="w-3 h-3 ml-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    );
  }

  if (type === "select") {
    return (
      <div className="inline-block relative">
        <select
          ref={selectRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onUpdate(e.target.value);
            onDeactivate();
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="inline-block px-3 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-0 focus:border-blue-500 focus:bg-white text-blue-700 font-medium shadow-sm transition-all duration-200 appearance-none cursor-pointer"
          style={{
            minWidth: width === "auto" ? "100px" : width,
            height: "40px", // Fixed height to match other fields
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: "right 8px center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "16px",
            paddingRight: "32px",
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type={type}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="inline-block px-3 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-0 focus:border-blue-500 focus:bg-white text-blue-700 font-medium placeholder-blue-400 shadow-sm transition-all duration-200"
      style={{
        width:
          width === "auto"
            ? `${Math.max(inputValue.length, placeholder.length) + 2}ch`
            : width,
        height: "40px", // Fixed height to match buttons
      }}
    />
  );
}
