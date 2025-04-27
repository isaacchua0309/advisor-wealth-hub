
import React from "react";

interface YearFilterProps {
  selectedYear: number | null;
  onClearYear: () => void;
}

export default function YearFilter({ selectedYear, onClearYear }: YearFilterProps) {
  if (!selectedYear) return null;
  
  return (
    <div className="mt-6 mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm">
      <span className="font-medium">Filtering policies active in year: {selectedYear}</span>
      <button 
        className="ml-2 text-green-600 hover:text-green-800 underline"
        onClick={onClearYear}
      >
        Clear year filter
      </button>
    </div>
  );
}
