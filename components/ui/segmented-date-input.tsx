"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface SegmentedDateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SegmentedDateInput({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  className = "",
}: SegmentedDateInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Parse the value into display format
  useEffect(() => {
    if (value && value !== "dd/mm/yyyy") {
      // If value is already formatted (contains slashes), use it as is
      if (value.includes('/')) {
        setInputValue(value);
      } else {
        // If value is raw (like "01012023"), format it
        const formatted = formatDateString(value);
        setInputValue(formatted);
      }
    } else {
      setInputValue("");
    }
  }, [value]);

  // Format raw date string to dd/mm/yyyy
  const formatDateString = (str: string) => {
    // Remove all non-digits
    const digits = str.replace(/\D/g, '');
    
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
  };

  // Handle manual input with auto-formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Remove all non-digits and slashes
    const cleanVal = val.replace(/[^\d\/]/g, '');
    
    // If user is typing and we have 8 digits, format it
    if (cleanVal.length >= 8 && !cleanVal.includes('/')) {
      const digits = cleanVal.replace(/\D/g, '');
      if (digits.length >= 8) {
        const formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
        setInputValue(formatted);
        onChange(formatted);
        return;
      }
    }
    
    // Auto-format as user types
    const formatted = formatDateString(cleanVal);
    setInputValue(formatted);
    
    // Only call onChange if we have a complete date
    if (formatted.length === 10 && formatted.includes('/')) {
      onChange(formatted);
    } else if (formatted === "") {
      onChange("");
    }
  };

  // Handle calendar selection
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      const formatted = `${day}/${month}/${year}`;
      
      setInputValue(formatted);
      onChange(formatted);
      setIsCalendarOpen(false);
    }
  };

  // Get current date for calendar
  const getCurrentDate = () => {
    if (inputValue && inputValue.length === 10 && inputValue.includes('/')) {
      const parts = inputValue.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
    }
    return undefined;
  };

  return (
    <div className={`relative flex items-center border rounded-md px-3 py-2 bg-white ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="flex-1 border-none outline-none bg-transparent text-sm focus:bg-blue-50 rounded focus:ring-2 focus:ring-blue-500"
        maxLength={10}
        onClick={(e) => {
          (e.target as HTMLInputElement).focus();
          (e.target as HTMLInputElement).select();
        }}
      />
      
      {/* Calendar Icon with Popover */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsCalendarOpen(true);
            }}
          >
            <CalendarIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Calendar
            mode="single"
            selected={getCurrentDate()}
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}