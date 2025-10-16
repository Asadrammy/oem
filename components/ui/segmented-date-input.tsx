"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface SegmentedDateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SegmentedDateInput({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  className = "",
  open,
  onOpenChange
}: SegmentedDateInputProps) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Parse the value into day, month, year
  useEffect(() => {
    if (value) {
      // Handle both / and - separators for flexibility
      const parts = value.split(/[\/\-]/);
      if (parts.length === 3) {
        setDay(parts[0] || "");
        setMonth(parts[1] || "");
        setYear(parts[2] || "");
      }
    } else {
      setDay("");
      setMonth("");
      setYear("");
    }
  }, [value]);

  // Update parent when segments change
  useEffect(() => {
    const formattedDate = `${day || "dd"}/${month || "mm"}/${year || "yyyy"}`;
    onChange(formattedDate);
  }, [day, month, year, onChange]);

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0, 2);
    if (val && parseInt(val) > 31) val = "31";
    setDay(val);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0, 2);
    if (val && parseInt(val) > 12) val = "12";
    setMonth(val);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    setYear(val);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      
      setDay(day);
      setMonth(month);
      setYear(year);
      setIsOpen(false);
    }
  };

  const getCurrentDate = () => {
    if (day && month && year && day !== "dd" && month !== "mm" && year !== "yyyy") {
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return undefined;
  };

  const isPopoverOpen = open !== undefined ? open : isOpen;
  const setPopoverOpen = onOpenChange || setIsOpen;

  return (
    <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
      <div className={`relative ${className}`}>
        {/* Simple segmented input */}
        <div className="flex items-center border rounded-md px-3 py-2 bg-white">
          <input
            type="text"
            value={day}
            onChange={handleDayChange}
            placeholder="dd"
            className="w-8 text-center border-none outline-none bg-transparent text-sm"
            maxLength={2}
          />
          <span className="mx-1 text-gray-400">/</span>
          
          <input
            type="text"
            value={month}
            onChange={handleMonthChange}
            placeholder="mm"
            className="w-8 text-center border-none outline-none bg-transparent text-sm"
            maxLength={2}
          />
          <span className="mx-1 text-gray-400">/</span>
          
          <input
            type="text"
            value={year}
            onChange={handleYearChange}
            placeholder="yyyy"
            className="w-12 text-center border-none outline-none bg-transparent text-sm"
            maxLength={4}
          />
          
          {/* Calendar Icon */}
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                setPopoverOpen(true);
              }}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </PopoverTrigger>
        </div>

        {/* Calendar Popover */}
        <PopoverContent className="p-0" align="start">
          <Calendar
            mode="single"
            selected={getCurrentDate()}
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </div>
    </Popover>
  );
}