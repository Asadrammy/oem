"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PaginatedDropdownProps<T> {
  label?: string;
 disabled?: boolean;  // Add this
  placeholder?: string;  // Add this
  value: string | undefined;
  onChange: (val: string) => void;
  fetchData: (page: number) => Promise<{
    results: T[];
    next?: string | null;
    previous?: string | null;
  }>;
  renderItem: (item: T) => { id: string; label: string }; // control how items appear
}

export function PaginatedDropdown<T>({
  label,
  value,
  onChange,
  fetchData,
  renderItem,
  disabled = false,  // Add this
  placeholder, 
}: PaginatedDropdownProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchData(page);
        setItems(data.results);
        setHasNext(Boolean(data.next));
        setHasPrev(Boolean(data.previous));
      } catch (err) {
        console.error("Dropdown fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, fetchData]);

  return (
    <div>
      {label && <Label>{label}</Label>}

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading..." : "Select option"} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => {
            const { id, label } = renderItem(item);
            return (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </Button>
        <span className="text-sm">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
