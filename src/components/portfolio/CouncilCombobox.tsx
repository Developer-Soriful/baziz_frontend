"use client";

import { useState, useRef, useEffect } from "react";
import { ukCouncils } from "@/lib/data/ukCouncils";
import { Input } from "../ui/form";
import { cn } from "@/lib/utils";

interface CouncilComboboxProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export function CouncilCombobox({
  value,
  onChange,
  placeholder = "Search local council...",
  className,
  error,
}: CouncilComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = ukCouncils.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (counc: string) => {
    onChange(counc);
    setSearch(counc);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onChange(val);
    setOpen(true);
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <Input
        type="text"
        value={search}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={cn(error && "border-danger focus:border-danger focus:ring-danger/25")}
      />
      {open && (filtered.length > 0 || search.trim() !== "") && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-surface shadow-float">
          {filtered.length > 0 ? (
            filtered.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleSelect(c)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-surface-2 transition"
              >
                {c}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-text-faint italic">
              No matching council. Press Enter to use free text.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
